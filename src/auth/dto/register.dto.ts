import { IsNotEmpty, IsString, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Имя пользователя', example: 'Иван' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Фамилия пользователя', example: 'Иванов' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'ИИН пользователя', example: '123456789012' })
  @IsString()
  @IsNotEmpty()
  iin: string;

  @ApiProperty({ description: 'Номер телефона пользователя', example: '+77771234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Электронная почта пользователя', example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Пароль пользователя', example: 'StrongPassword123' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 50, { message: 'Пароль должен содержать от 6 до 50 символов' })
  password: string;
}