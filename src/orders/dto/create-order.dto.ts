import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Количество месяцев заказа', example: 3 })
  @IsNumber({}, { message: 'Количество месяцев должно быть числом' })
  @IsNotEmpty({ message: 'Количество месяцев обязательно для заполнения' })
  numberOfMonths: number;

  @ApiProperty({ description: 'Ежемесячная стоимость заказа', example: 1500 })
  @IsNumber({}, { message: 'Ежемесячная стоимость должна быть числом' })
  @IsNotEmpty({ message: 'Ежемесячная стоимость обязательна для заполнения' })
  monthlyPrice: number;

  @ApiProperty({ description: 'UUID ссылки оплаты', example: 'abc123-uuid-456' })
  @IsString({ message: 'UUID ссылки оплаты должно быть строкой' })
  @IsNotEmpty({ message: 'UUID ссылки оплаты обязателен для заполнения' })
  linkUUID: string;
}