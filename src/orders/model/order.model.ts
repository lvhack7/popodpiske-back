import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { User } from "src/users/model/user.model";
import { PaymentLink } from "../../links/model/payment-link.model";
import { Payment } from "src/payments/model/payment.model";


export interface OrderCreationAttrs {
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
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @Column({type:  DataType.DECIMAL(10, 2), allowNull: true})
    totalPrice: number

    @Column({type: DataType.INTEGER, allowNull: false})
    numberOfMonths: number

    @Column({type: DataType.DECIMAL(10, 2), allowNull: false})
    monthlyPrice: number

    @Column({type: DataType.TEXT, allowNull: false, defaultValue: 'active'})
    status: string

    @Column({type: DataType.TEXT, allowNull: true})
    recurrentToken: string

    @Column({type: DataType.INTEGER, allowNull: false})
    remainingMonth: number

    @Column({type: DataType.DATEONLY, allowNull: true})
    nextBillingDate: string

    @Column({type: DataType.TEXT, allowNull: true})
    paymentId: string

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER, allowNull: false})
    userId: number

    @BelongsTo(() => User)
    user: User

    @ForeignKey(() => PaymentLink)
    @Column({type: DataType.INTEGER, allowNull: false})
    linkId: number

    @BelongsTo(() => PaymentLink)
    link: PaymentLink

    @HasMany(() => Payment)
    payments: Payment[]
}