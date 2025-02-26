// register.dto.ts
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAdminDto {
  @ApiProperty({ description: 'Логин администратора', example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ description: 'Пароль администратора', example: 'StrongPassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @ApiProperty({ description: 'Роль администратора', example: 'admin' })
  @IsString()
  @IsNotEmpty()
  role: string;
}