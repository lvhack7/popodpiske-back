import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCourseDto {
  @ApiProperty({ description: 'ID курса', example: 1 })
  @IsNumber({}, { message: 'ID курса должен быть числом' })
  @IsNotEmpty({ message: 'ID курса обязателен' })
  id: number;

  @ApiProperty({ description: 'Название курса', example: 'Курс по английскому' })
  @IsString({ message: 'Название курса должно быть строкой' })
  @IsNotEmpty({ message: 'Название курса не должно быть пустым' })
  courseName: string;

  @ApiProperty({ description: 'Общая стоимость курса', example: 15000 })
  @IsNumber({}, { message: 'Стоимость курса должна быть числом' })
  @IsNotEmpty({ message: 'Стоимость курса не должна быть пустой' })
  totalPrice: number;
}