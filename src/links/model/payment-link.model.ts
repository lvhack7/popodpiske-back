import { Table, Column, Model, DataType, HasOne, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../../orders/model/order.model';
import { Admin } from 'src/admin/model/admin.model';
import { Course } from '../../courses/model/course.model';

export interface PaymentLinkCreationAttrs {
  uuid: string;
  createdBy: number;
  isUsed: boolean;
  expiresAt: Date;
  adminId: number;
  courseId: number;
  monthsArray: number[];
}

@Table({
  tableName: 'payment-links',
  timestamps: true,
})
export class PaymentLink extends Model<PaymentLink, PaymentLinkCreationAttrs> {
  @ApiProperty({ description: 'Уникальный идентификатор ссылки оплаты', example: 1 })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ description: 'UUID ссылки оплаты', example: 'e2b2f5e0-3d1a-4b6f-8c3a-1a2d3e4f5b6c' })
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, unique: true })
  uuid: string;

  @ApiProperty({ description: 'Флаг, использована ли ссылка оплаты', example: false })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isUsed: boolean;

  @ApiProperty({ description: 'Дата истечения срока действия ссылки оплаты', example: '2025-02-25T00:00:00.000Z', required: false })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiresAt: Date;

  @ApiProperty({ description: 'Массив месяцев для оплаты', example: [1, 2, 3], required: false })
  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    allowNull: true,
  })
  monthsArray: number[];

  @ApiProperty({ description: 'Заказ, связанный с данной ссылкой оплаты', type: () => Order, required: false })
  @HasOne(() => Order)
  order: Order;

  @ApiProperty({ description: 'Идентификатор администратора, создавшего ссылку оплаты', example: 1 })
  @ForeignKey(() => Admin)
  @Column({ type: DataType.INTEGER, allowNull: false })
  adminId: number;

  @ApiProperty({ description: 'Идентификатор курса, для которого создана ссылка оплаты', example: 1 })
  @ForeignKey(() => Course)
  @Column({ type: DataType.INTEGER, allowNull: false })
  courseId: number;

  @ApiProperty({ description: 'Курс, связанный со ссылкой оплаты', type: () => Course })
  @BelongsTo(() => Course, {
    onDelete: 'CASCADE'
  })
  course: Course;

  @ApiProperty({ description: 'Администратор, создавший ссылку оплаты', type: () => Admin })
  @BelongsTo(() => Admin)
  admin: Admin;
}