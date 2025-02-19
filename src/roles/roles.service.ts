import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Roles } from './model/role.model';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {

    constructor(
        @InjectModel(Roles) private readonly roleModel: typeof Roles
    ) {}

    async createRole(dto: CreateRoleDto) {
        const role = await this.roleModel.create(dto);
        return role;
    }

    async getRoleByValue(value: string) {
        const role = await this.roleModel.findOne({where: {value}})
        return role;
    }

    async getAllRoles() {
        const roles = await this.roleModel.findAll()
        return roles;
    }

}
