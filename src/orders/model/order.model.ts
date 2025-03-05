import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { User } from "src/users/model/user.model";
import { PaymentLink } from "../../links/model/payment-link.model";
import { Payment } from "src/payments/model/payment.model";
import { ApiProperty } from "@nestjs/swagger";
import { TEXT } from "sequelize";


export interface OrderCreationAttrs {
  courseName: string
  totalPrice: number;
  numberOfMonths: number;
  monthlyPrice: number;
  nextBillingDate?: string;
  recurrentToken?: string;
  remainingMonth: number;
  status: string;
  userId: number;
  linkId: number;
  paymentId: string;
}

@Table({ tableName: 'order', timestamps: true })
export class Order extends Model<Order, OrderCreationAttrs> {
  
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор заказа' })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ example: "Course", description: 'Название курса' })
  @Column({ type: TEXT, allowNull: true })
  courseName: string;

  @ApiProperty({ example: 4500, description: 'Общая стоимость заказа' })
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: true })
  totalPrice: number;

  @ApiProperty({ example: 3, description: 'Количество месяцев заказа' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  numberOfMonths: number;

  @ApiProperty({ example: 1500, description: 'Ежемесячная стоимость заказа' })
  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  monthlyPrice: number;

  @ApiProperty({ example: 'active', description: 'Статус заказа' })
  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: 'active' })
  status: string;

  @ApiProperty({ example: 'some-recurrent-token', description: 'Рекуррентный токен заказа' })
  @Column({ type: DataType.TEXT, allowNull: true })
  recurrentToken: string;

  @ApiProperty({ example: 1, description: 'Количество оставшихся месяцев заказа' })
  @Column({ type: DataType.INTEGER, allowNull: false })
  remainingMonth: number;

  @ApiProperty({ example: '2025-02-28', description: 'Дата следующего списания' })
  @Column({ type: DataType.DATEONLY, allowNull: true })
  nextBillingDate: string;

  @ApiProperty({ example: 'pay-123456', description: 'Идентификатор платежа' })
  @Column({ type: DataType.TEXT, allowNull: true })
  paymentId: string;

  @ApiProperty({ example: 1, description: 'Идентификатор пользователя' })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId: number;

  @ApiProperty({ description: 'Пользователь, связанный с заказом', type: () => User })
  @BelongsTo(() => User)
  user: User;

  @ApiProperty({ example: 4, description: 'Идентификатор ссылки оплаты' })
  @ForeignKey(() => PaymentLink)
  @Column({ type: DataType.INTEGER, allowNull: false })
  linkId: number;

  @ApiProperty({ description: 'Ссылка оплаты, связанная с заказом', type: () => PaymentLink })
  @BelongsTo(() => PaymentLink)
  link: PaymentLink;

  @ApiProperty({ description: 'Список платежей, связанных с заказом', type: () => [Payment] })
  @HasMany(() => Payment)
  payments: Payment[];
}