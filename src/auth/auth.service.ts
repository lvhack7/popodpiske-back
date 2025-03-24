import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { RefreshToken } from 'src/users/model/refresh-token.model';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { User } from 'src/users/model/user.model';
import { Payload } from './dto/payload.dto';
import { Roles } from 'src/roles/model/role.model';
import { RegisterDto } from './dto/register.dto';
import { RolesService } from 'src/roles/roles.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SmsService } from 'src/sms/sms.service';


@Injectable()
export class AuthService {

    constructor(private userService: UsersService,
        private jwtService: JwtService,
        private smsService: SmsService,
        @InjectModel(RefreshToken) private refreshRepo: typeof RefreshToken) {}

    async login(dto: LoginDto) {
        const user = await this.userService.getUserByPhone(dto.phone)

        if (!user) {
            throw new BadRequestException("Пользователя не существует")
        }

        const passwordMatch = await bcrypt.compare(dto.password, user.password)
        if (!passwordMatch) {
            throw new BadRequestException("Неправильный логин или пароль")
        }

        const tokens = await this.generateTokens(user)
        await this.hashAndSaveRefreshToken(tokens.refreshToken, user)
        return tokens
    }

    async register(dto: RegisterDto) {
        const user = await this.userService.getUserByPhone(dto.phone)
        if (user) {
            throw new BadRequestException("Пользователь уже существует")
        }

        const codeVerified = await this.smsService.findVerified(dto.phone)
        if (!codeVerified) {
            throw new BadRequestException("Телефон не был подтвержден!")
        }

        const hashedPassword = await bcrypt.hash(dto.password, 5)
        
        const newUser = await this.userService.createUser({
            ...dto,
            password: hashedPassword
        })
        
        const tokens = await this.generateTokens(newUser)
        await this.hashAndSaveRefreshToken(tokens.refreshToken, newUser)
        return tokens
    }

    async checkPhone(phone: string) {
        const user = await this.userService.getUserByPhone(phone)
        return {
            exists: user ? true : false
        }
    }

    async refresh(user: any) {
        const founduser = await this.userService.getUserById(user.id)
        const refreshTokens = await this.refreshRepo.findAll({where: {userId: user.id}})

        if (!founduser) {
            throw new NotFoundException("Пользователь не найден")
        }

        if (refreshTokens.length === 0) {
            console.log("NO REF TOKEN")
            throw new ForbiddenException('Доступ запрещен')
        }

        let matchTokens = false;
        for (const token of refreshTokens) {
            const isMatch = await bcrypt.compare(user.refreshToken, token.token);
            if (isMatch) {
                matchTokens = true;
                break // Valid token found
            }
        }

        if (!matchTokens) {
            console.log("TOKENS DONT MATCH")
            throw new ForbiddenException('Доступ запрещен')
        }

        const tokens = await this.generateTokens(founduser)
        await this.hashAndSaveRefreshToken(tokens.refreshToken, founduser)
        return tokens
    }

    async resetPassword(dto: ResetPasswordDto) {
        const user = await this.userService.getUserByPhone(dto.phone)
        if (!user) {
            throw new BadRequestException("Пользователь не найден")
        }

        const resetToken = await this.smsService.getRecordByToken(dto.token)
        if (!resetToken) {
            throw new BadRequestException("Токен не действительный")
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 5)
        user.password = hashedPassword

        await user.save()
        await resetToken.destroy()

        return { message: "Пароль был изменен" }
    }

    private async generateTokens(user: User) {
        const payload: Payload = {
            id: user.id, 
            firstName: user.firstName,
            lastName: user.lastName,
            iin: this.maskIIN(user.iin),
            phone: user.phone,
            email: user.email
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
            user: payload
        };
    }

    private async hashAndSaveRefreshToken(refreshToken: string, user: User) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 3)
        const refresh = await this.refreshRepo.findOne({where: {userId: user.id}})
        if (!refresh) {
            const refresh = await this.refreshRepo.create({
                token: hashedRefreshToken,
                userId: user.id
            })
            refresh.user = user
            await refresh.save()
            return refreshToken
        }

        refresh.token = hashedRefreshToken
        await refresh.save()

        return refresh
    }

    private maskIIN(iin: string): string {
        if (iin.length < 5) {
          throw new Error("Invalid IIN format");
        }
        return `${iin.slice(0, 2)}***${iin.slice(-3)}`;
    }

    private maskPhoneNumber(phone: string): string {      
        const visibleDigits = phone.slice(-4); // Get the last 4 digits
        const maskedPart = phone.slice(0, -4).replace(/\d/g, '*'); // Mask all but the last 4 digits
      
        // Format the masked phone number
        return `+7 (${maskedPart.slice(2, 5)}) ${maskedPart.slice(5, 8)} ${maskedPart.slice(8, 10)} ${visibleDigits}`;
    }
      
}
