import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';
import { Public } from 'src/common/decorators/public-route.decorator';

@Controller('roles')
export class RolesController {

    constructor(
        private readonly rolesService: RolesService
    ) {}

    @Public()
    @Post()
    async createRole(@Body() dto: CreateRoleDto) {
        return await this.rolesService.createRole(dto)
    }

    @Public()
    @Get()
    async getRoles() {
        return await this.rolesService.getAllRoles()
    }
}
