import { Body, Controller, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { Public } from 'src/common/decorators/public-route.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Регистрация пользователя и возвращает токен доступа с данными пользователя',
    description: 'Регистрирует нового пользователя.',
  })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован.' })
  @ApiResponse({ status: 400, description: 'Неверные входные данные.' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.register(dto);
    res.cookie('refreshToken', data.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return {
      accessToken: data.accessToken,
      user: data.user,
    };
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Авторизация пользователя',
    description: 'Авторизует пользователя и возвращает токен доступа с данными пользователя.',
  })
  @ApiResponse({ status: 200, description: 'Пользователь успешно авторизован.' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные.' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.login(dto);
    res.cookie('refreshToken', data.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return {
      accessToken: data.accessToken,
      user: data.user,
    };
  }

  @Public()
  @Post('check-phone')
  @ApiOperation({
    summary: 'Проверка телефона',
    description: 'Проверяет, существует ли пользователь с телефоном.',
  })
  @ApiResponse({ status: 200, description: 'Телефон проверен.' })
  async checkPhone(@Body() dto: { phone: string }) {
    return await this.authService.checkPhone(dto.phone);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({
    summary: 'Сброс пароля',
    description: 'Сбрасывает пароль пользователя с использованием токена для сброса.',
  })
  @ApiResponse({ status: 200, description: 'Пароль успешно сброшен.' })
  @ApiResponse({ status: 400, description: 'Неверные данные для сброса пароля.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @ApiOperation({
    summary: 'Обновление токена',
    description: 'Обновляет токен доступа с использованием refresh-токена.',
  })
  @ApiResponse({ status: 200, description: 'Токен успешно обновлён.' })
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    const data = await this.authService.refresh(user);
    res.cookie('refreshToken', data.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return {
      accessToken: data.accessToken,
      user: data.user,
    };
  }
}