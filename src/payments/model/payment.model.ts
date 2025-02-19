// src/models/payment.model.ts
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
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @ForeignKey(() => Order)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    orderId: number;

    @BelongsTo(() => Order)
    order: Order;

    // Total amount charged for this payment
    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    amount: number;

    // Currency used
    @Column({
        type: DataType.STRING,
        defaultValue: 'KZT',
    })
    currency: string;

    // Current status: e.g. "paid", "failed", "pending", etc.
    @Column({
        type: DataType.STRING,
        defaultValue: 'pending',
    })
    status: string;

    // Date/time when the payment was processed
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
    })
    paymentDate: Date;

    // A transaction ID or reference from the payment gateway
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    transactionId?: string;
}