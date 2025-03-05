import { IsNumber, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateLinkDto {
  @ApiProperty({ description: 'Идентификатор курса', example: 1 })
  @IsNumber({}, { message: 'Идентификатор курса должен быть числом' })
  courseId: number;

  @ApiProperty({ description: 'Массив месяцев для оплаты', example: [1, 2, 3] })
  @IsArray({ message: 'Массив месяцев должен быть массивом чисел' })
  monthsArray: number[];

  @ApiPropertyOptional({ description: 'Идентификатор администратора', example: 1 })
  @IsOptional()
  @IsNumber({}, { message: 'Идентификатор администратора должен быть числом' })
  adminId?: number;
}