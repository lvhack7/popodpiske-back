import { Body, Controller, Delete, Get, Param, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public-route.decorator';
import { RegisterAdminDto } from './dto/register.dto';
import { LoginAdminDto } from './dto/login.dto';
import { Role } from 'src/common/enum/roles.enum';
import { AuthGuard } from '@nestjs/passport';


@Controller('admin')
export class AdminController {

    constructor(private readonly adminService: AdminService,
    ) {}

    //@Roles(Role.Admin)
    @Public()
    @Post("register")
    async registerAdmin(@Body() dto: RegisterAdminDto) {
        return await this.adminService.register(dto);
    }

    @Public()
    @Post("login")
    async loginAdmin(@Body() dto: LoginAdminDto, @Res({passthrough: true}) res: Response) {
        const data = await this.adminService.login(dto)

        res.cookie('adminRefreshToken', data.refreshToken,
        {   maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict', // Prevent cross-origin cookie sharing
        })

        return {
            accessToken: data.accessToken,
            admin: data.admin
        }
    }

    @Public()
    @UseGuards(AuthGuard('jwt-admin-refresh'))
    @Post("refresh")
    async refresh(@Request() req, @Res({passthrough: true}) res: Response) {
        const admin = req.user
        const data = await this.adminService.refresh(admin)
        res.cookie('adminRefreshToken', data.refreshToken,
                {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        
        return {
            accessToken: data.accessToken,
            user: data.admin
        }
    }

    @Roles(Role.Admin)
    @Delete("/:id")
    async removeAdmin(@Param('id') adminId: number) {
        return await this.adminService.removeAdmin(adminId)
    }

    @Roles(Role.Admin)
    @Get()
    async getAdmins() {
        return await this.adminService.getAdmins()
    }
}
