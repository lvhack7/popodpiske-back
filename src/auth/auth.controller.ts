import { Body, Controller, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { Public } from 'src/common/decorators/public-route.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Public()
    @Post("register")
    async register(@Body() dto: RegisterDto, @Res({passthrough: true}) res: Response) {
        const data = await this.authService.register(dto)
        res.cookie('refreshToken', data.refreshToken,
            {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        return {
            accessToken: data.accessToken,
            user: data.user
        }
    }

    @Public()
    @Post("login")
    async login(@Body() dto: LoginDto,
            @Res({passthrough: true}) res: Response) 
    {
        const data = await this.authService.login(dto)
        res.cookie('refreshToken', data.refreshToken,
                {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        return {
            accessToken: data.accessToken,
            user: data.user
        }
    }

    @Public()
    @Post("check-phone")
    async checkPhone(@Body() dto: {phone: string}) {
        return await this.authService.checkPhone(dto.phone)
    }

    @Public()
    @Post("reset-password")
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return await this.authService.resetPassword(dto)
    }

    @Public()
    @UseGuards(AuthGuard('jwt-refresh'))
    @Post("refresh")
    async refresh(@Request() req, @Res({passthrough: true}) res: Response) {
        const user = req.user
        const data = await this.authService.refresh(user)
        res.cookie('refreshToken', data.refreshToken,
                {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        return {
            accessToken: data.accessToken,
            user: data.user
        }
    }

}
