// admin.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public-route.decorator';
import { RegisterAdminDto } from './dto/register.dto';
import { LoginAdminDto } from './dto/login.dto';
import { Role } from 'src/common/enum/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam 
} from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';


@ApiTags('Администратор')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Roles(Role.Admin, Role.SuperAdmin)
  @Post('register')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Регистрация администратора', description: 'Регистрирует нового администратора с заданными данными.' })
  @ApiResponse({ status: 201, description: 'Администратор успешно зарегистрирован.' })
  @ApiResponse({ status: 400, description: 'Неверные входные данные.' })
  async registerAdmin(@Body() dto: RegisterAdminDto, @Request() req) {
    const admin = req.user;
    return await this.adminService.register(dto, admin.roles);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Вход администратора', description: 'Авторизует администратора и возвращает токен доступа вместе с данными администратора.' })
  @ApiResponse({ status: 200, description: 'Администратор успешно авторизован.' })
  @ApiResponse({ status: 401, description: 'Неавторизован.' })
  async loginAdmin(
    @Body() dto: LoginAdminDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.adminService.login(dto);
    res.cookie('adminRefreshToken', data.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
    });
    return {
      accessToken: data.accessToken,
      admin: data.admin,
    };
  }

  @Public()
  @UseGuards(AuthGuard('jwt-admin-refresh'))
  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токена администратора', description: 'Обновляет токен доступа с использованием refresh-токена.' })
  @ApiResponse({ status: 200, description: 'Токен успешно обновлён.' })
  async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
    const admin = req.user;
    const data = await this.adminService.refresh(admin);
    res.cookie('adminRefreshToken', data.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return {
      accessToken: data.accessToken,
      user: data.admin,
    };
  }

  @Roles(Role.Admin, Role.SuperAdmin)
  @Delete('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удаление администратора', description: 'Удаляет администратора по указанному идентификатору.' })
  @ApiParam({ name: 'id', type: Number, description: 'Идентификатор администратора для удаления' })
  @ApiResponse({ status: 200, description: 'Администратор успешно удалён.' })
  @ApiResponse({ status: 404, description: 'Администратор не найден.' })
  async removeAdmin(@Param('id') adminId: number) {
    const admin = req.user;
    return await this.adminService.removeAdmin(adminId, admin.roles);
  }

  @Roles(Role.Admin)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение списка администраторов', description: 'Возвращает список всех администраторов.' })
  @ApiResponse({ status: 200, description: 'Список администраторов успешно получен.' })
  async getAdmins() {
    return await this.adminService.getAdmins();
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Изменение пароля администратора', description: 'Изменяет пароль администратора.' })
  @ApiResponse({ status: 200, description: 'Пароль успешно изменен.' })
  @ApiResponse({ status: 400, description: 'Неверные входные данные.' })
  @ApiResponse({ status: 404, description: 'Администратор не найден.' })
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    const admin = req.user;
    return await this.adminService.changePassword(admin.id, dto);
  }
}