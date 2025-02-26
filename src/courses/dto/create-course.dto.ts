import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ description: 'Название курса', example: 'Курс по программированию' })
  @IsString({ message: 'Название курса должно быть строкой' })
  @IsNotEmpty({ message: 'Название курса не должно быть пустым' })
  courseName: string;

  @ApiProperty({ description: 'Общая стоимость курса', example: 15000 })
  @IsNumber({}, { message: 'Стоимость курса должна быть числом' })
  @IsNotEmpty({ message: 'Стоимость курса не должна быть пустой' })
  totalPrice: number;
}