import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Admin } from './model/admin.model';
import { LoginAdminDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { AdminRefreshToken } from './model/admin-refresh-token.model';
import { RegisterAdminDto } from './dto/register.dto';
import { RolesService } from 'src/roles/roles.service';
import { Role } from 'src/common/enum/roles.enum';
import { ChangePasswordDto } from './dto/change-password.dto';


@Injectable()
export class AdminService {

    constructor(
        @InjectModel(Admin) private readonly adminModel: typeof Admin,
        @InjectModel(AdminRefreshToken) private refreshRepo: typeof AdminRefreshToken,
        private jwtService: JwtService,
        private roleService: RolesService,
    ) {}
    
    async login(dto: LoginAdminDto) {
        const admin = await this.adminModel.findOne({ where: { login: dto.login }, include: {all: true} })

        if (!admin) {
            throw new BadRequestException("Пользователя не существует")
        }

        const passwordMatch = await bcrypt.compare(dto.password, admin.password)
        if (!passwordMatch) {
            throw new BadRequestException("Неправильный логин или пароль")
        }

        const tokens = await this.generateTokens(admin)
        await this.hashAndSaveRefreshToken(tokens.refreshToken, admin)
        return tokens
    }

    async register(dto: RegisterAdminDto, roles: string[]) {
        const admin = await this.adminModel.findOne({ where: { login: dto.login } });
        if (admin) {
            throw new BadRequestException("Пользователь под логином уже существует");
        }
    
        const hashedPassword = await bcrypt.hash(dto.password, 5);
    
        // Check if the current admin has the necessary roles to create the new admin
        const canCreateAdmin = roles.includes(Role.SuperAdmin);
        const canCreateManager = roles.includes(Role.SuperAdmin) || roles.includes(Role.Admin);
    
        if (dto.role === Role.Admin && !canCreateAdmin) {
            throw new ForbiddenException("Только Главный Админ может создать пользователя с ролью Админ");
        }
    
        if (dto.role === Role.Manager && !canCreateManager) {
            throw new ForbiddenException("Только Главный Админ или Админ может создать пользователя с ролью Менеджер");
        }
    
        const newAdmin = await this.adminModel.create({
            login: dto.login,
            password: hashedPassword,
        });
    
        const role = await this.roleService.getRoleByValue(dto.role);
    
        await newAdmin.$set('roles', [role]);
    
        return { message: "Пользователь создан!" };
    }

    async refresh(admin: any) {
        const foundadmin = await this.adminModel.findOne({where: {id: admin.id}})
        const refreshTokens = await this.refreshRepo.findAll({where: {adminId: admin.id}})

        if (!foundadmin) {
            throw new NotFoundException("Пользователь не найден")
        }

        if (refreshTokens.length === 0) {
            console.log("ADMIN: ", admin)
            console.log("NO REF TOKEN")
            throw new ForbiddenException('Доступ запрещен')
        }

        let matchTokens = false;
        for (const token of refreshTokens) {
            const isMatch = await bcrypt.compare(admin.refreshToken, token.token);
            if (isMatch) {
                matchTokens = true;
                break // Valid token found
            }
        }

        if (!matchTokens) {
            console.log("TOKENS DONT MATCH")
            throw new ForbiddenException('Доступ запрещен')
        }

        const tokens = await this.generateTokens(foundadmin)
        await this.hashAndSaveRefreshToken(tokens.refreshToken, foundadmin)
        return tokens
    }

    async changePassword(adminId: number, dto: ChangePasswordDto) {
        const admin = await this.adminModel.findByPk(adminId);
        if (!admin) {
          throw new BadRequestException('Пользователь не найден');
        }
    
        const passwordMatch = await bcrypt.compare(dto.oldPassword, admin.password);
        if (!passwordMatch) {
          throw new BadRequestException('Текущий пароль неверен');
        }
    
        const hashedNewPassword = await bcrypt.hash(dto.newPassword, 5);
        admin.password = hashedNewPassword;
        await admin.save();
    
        return { message: 'Пароль успешно изменен' };
    }

    async getAdmins() {
        console.log("ADMINS")
        return await this.adminModel.findAll({
            include: {all: true},
            order: [['id', 'ASC']],
        })
    }

    async removeAdmin(adminId: number, roles: string[]) {
        const admin = await this.adminModel.findByPk(adminId, {include: {all: true}})
        if (!admin) {
            throw new BadRequestException("Пользователь не найден")
        }

        const canDeleteAdmin = roles.includes(Role.SuperAdmin);
        const canDeleteManager = roles.includes(Role.SuperAdmin) || roles.includes(Role.Admin);
    
        if (admin.roles.map((role) => role.value).includes(Role.Admin) && !canDeleteAdmin) {
            throw new ForbiddenException("Только Главный Админ может удалить пользователя с ролью Админ");
        }
    
        if (admin.roles.map((role) => role.value).includes(Role.Manager) && !canDeleteManager) {
            throw new ForbiddenException("Только Админ может удалить пользователя с ролью Менеджер");
        }

        await admin.destroy()
    }

    private async generateTokens(admin: Admin) {
        const payload = {
            id: admin.id,
            login: admin.login,
            roles: admin.roles.map(role => role.value)
        }

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '30m',
        })

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '30d',
        })

        return {
            accessToken,
            refreshToken,
            admin: payload
        };
    }
    
    private async hashAndSaveRefreshToken(refreshToken: string, admin: Admin) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 3)
        const refresh = await this.refreshRepo.findOne({where: {adminId: admin.id}})
        if (!refresh) {
            await this.refreshRepo.create({
                token: hashedRefreshToken,
                adminId: admin.id
            })

            return refreshToken
        }

        refresh.token = hashedRefreshToken
        await refresh.save()

        return refresh
    }

}
