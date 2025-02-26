import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Логин пользователя', example: 'user123' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ description: 'Пароль пользователя', example: 'StrongPassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}