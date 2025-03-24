import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Телефон', example: '+77777777777' })
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