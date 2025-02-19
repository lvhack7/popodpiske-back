import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { RefreshToken } from "./refresh-token.model";
import { Order } from "src/orders/model/order.model";
import { SMSCodes } from "src/sms/model/sms-codes.model";


interface UserCreationAttrs {
    firstName: string
    lastName: string
    email: string
    phone: string
    iin: string
    password?: string
    status?: "Pending" | "Verified" | "Active"
}
                                            
@Table({ tableName: 'user', timestamps: true })
export class User extends Model<User, UserCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @Column({type: DataType.TEXT, allowNull: false})
    firstName: string

    @Column({type: DataType.TEXT, allowNull: false})
    lastName: string

    @Column({type: DataType.TEXT, allowNull: true})
    email: string

    @Column({type: DataType.TEXT, allowNull: false})
    phone: string

    @Column({type: DataType.TEXT, allowNull: false})
    iin: string

    @Column({type: DataType.TEXT, allowNull: true})
    password: string

    @Column({type: DataType.TEXT, defaultValue: "New"})
    status: string

    @HasMany(() => Order)
    orders: Order[]

    @HasMany(() => RefreshToken)
    tokens: RefreshToken[]
}