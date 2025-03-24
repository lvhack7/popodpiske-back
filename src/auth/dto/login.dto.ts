import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Телефон пользователя', example: '+77777777777' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Пароль пользователя', example: 'StrongPassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}