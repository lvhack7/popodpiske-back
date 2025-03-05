import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentLink } from 'src/links/model/payment-link.model';

export interface CourseCreationAttrs {
  courseName: string;
  totalPrice: number;
}

@Table({
  tableName: 'course',
  timestamps: true,
})
export class Course extends Model<Course, CourseCreationAttrs> {
  @ApiProperty({ description: 'Уникальный идентификатор курса', example: 1 })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ description: 'Название курса', example: 'Курс по программированию' })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
    unique: true,
  })
  courseName: string;

  @ApiProperty({ description: 'Общая стоимость курса', example: 15000.00 })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalPrice: number;

  @ApiProperty({ description: 'Ссылки оплаты, связанные с курсом', type: [PaymentLink] })
  @HasMany(() => PaymentLink)
  links: PaymentLink[];
}