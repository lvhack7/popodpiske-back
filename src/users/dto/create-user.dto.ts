import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Имя пользователя', example: 'Иван' })
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя не должно быть пустым' })
  firstName: string;

  @ApiProperty({ description: 'Фамилия пользователя', example: 'Иванов' })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @IsNotEmpty({ message: 'Фамилия не должна быть пустой' })
  lastName: string;

  @ApiProperty({ description: 'Номер телефона пользователя', example: '+7 (777) 123-45-67' })
  @IsString({ message: 'Номер телефона должен быть строкой' })
  @IsNotEmpty({ message: 'Номер телефона обязателен' })
  phone: string;

  @ApiProperty({ description: 'ИИН пользователя', example: '123456789012' })
  @IsString({ message: 'ИИН должен быть строкой' })
  @IsNotEmpty({ message: 'ИИН обязателен' })
  iin: string;

  @ApiProperty({ description: 'Электронная почта пользователя', example: 'ivanov@example.com' })
  @IsEmail({}, { message: 'Неверный формат электронной почты' })
  email: string;

  @ApiProperty({ description: 'Пароль пользователя', example: 'StrongPassword123' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @Length(6, 50, { message: 'Пароль должен содержать от 6 до 50 символов' })
  password: string;
}