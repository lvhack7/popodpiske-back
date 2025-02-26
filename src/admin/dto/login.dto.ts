// login.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminDto {
  @ApiProperty({ description: 'Логин администратора', example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ description: 'Пароль администратора', example: 'StrongPassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}