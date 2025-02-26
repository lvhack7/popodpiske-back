// src/models/payment.model.ts
import { ApiProperty } from '@nestjs/swagger';
import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { Order } from 'src/orders/model/order.model';
  

interface PaymentCreationAttrs {
    orderId: number;
    amount: number;
    currency: string;
    status: string;
    paymentDate: Date;
    transactionId?: string;
}

@Table({ tableName: 'payments' })
export class Payment extends Model<Payment, PaymentCreationAttrs> {
  
  @ApiProperty({ description: 'Уникальный идентификатор платежа', example: 1 })
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ApiProperty({ description: 'Идентификатор заказа, к которому относится платеж', example: 123 })
  @ForeignKey(() => Order)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  orderId: number;

  @ApiProperty({ description: 'Заказ, связанный с платежом', type: () => Order })
  @BelongsTo(() => Order)
  order: Order;

  @ApiProperty({ description: 'Общая сумма платежа', example: 1500.50 })
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @ApiProperty({ description: 'Валюта платежа', example: 'KZT' })
  @Column({
    type: DataType.STRING,
    defaultValue: 'KZT',
  })
  currency: string;

  @ApiProperty({ description: 'Статус платежа (например, "paid", "failed", "pending")', example: 'pending' })
  @Column({
    type: DataType.STRING,
    defaultValue: 'pending',
  })
  status: string;

  @ApiProperty({ description: 'Дата и время проведения платежа', example: '2025-02-25T12:00:00Z' })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  paymentDate: Date;

  @ApiProperty({ description: 'Идентификатор транзакции платежного шлюза', example: 'trans-123456', required: false })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  transactionId?: string;
}