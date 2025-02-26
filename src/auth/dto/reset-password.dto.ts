import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Номер телефона пользователя', example: '+77771234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Новый пароль пользователя', example: 'NewStrongPassword123' })
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ description: 'Токен для сброса пароля', example: 'some-reset-token' })
  @IsString()
  @IsNotEmpty()
  token: string;
}