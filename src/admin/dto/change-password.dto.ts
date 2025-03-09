import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({ description: 'Текущий пароль', example: 'currentPassword123' })
    @IsString({ message: 'Текущий пароль должен быть строкой' })
    oldPassword: string;

    @ApiProperty({ description: 'Новый пароль', example: 'newPassword123' })
    @IsString({ message: 'Новый пароль должен быть строкой' })
    @MinLength(6, { message: 'Новый пароль должен содержать минимум 6 символов' })
    newPassword: string;
}