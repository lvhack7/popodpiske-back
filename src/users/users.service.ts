import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './model/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'src/roles/model/role.model';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User) private readonly userRepo: typeof User
    ) {}

    async createUser(dto: CreateUserDto) {
        return await this.userRepo.create(dto)
    }
 
    async getUserByPhone(phone: string): Promise<User> {
        return await this.userRepo.findOne({where: {phone}})
    }

    async getUserByEmail(email: string): Promise<User> {
        return await this.userRepo.findOne({where: {email}})
    }

    // async getByPhoneOrEmail(phone: string, email: string): Promise<User | null> {
    //     const user = await this.userRepo.findOne({
    //       where: {
    //         [Op.or]: [
    //           { phone },
    //           { email },
    //         ],
    //       },
    //       include: {all: true}, // Only fetch `value` from roles
    //     });
    
    //     return user;
    // }
    
    async getUserById(id: number): Promise<User> {
        return await this.userRepo.findByPk(id, {
            include: {all: true}, // Only fetch `value` from roles
        })
    }

    async changeStatus(status: "Pending" | "Verified" | "Active", userId: number) {
        const user = await this.userRepo.findByPk(userId)
        if (!user) {
            throw new NotFoundException("Пользователь не найден")
        }

        user.status = status
        await user.save()
    }

}
