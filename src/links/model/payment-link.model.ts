import {
    Table,
    Column,
    Model,
    DataType,
    HasOne,
    BelongsTo,
    ForeignKey,
} from 'sequelize-typescript';
import { Order } from '../../orders/model/order.model';
import { Admin } from 'src/admin/model/admin.model';
import { Course } from '../../courses/model/course.model';


interface PaymentLinkCreationAttrs {
    uuid: string
    createdBy: number;
    isUsed: boolean;
    expiresAt: Date;
    adminId: number;
    courseId: number;
    monthsArray: number[];
}

@Table({
    tableName: 'payment-links',
    timestamps: true
})
export class PaymentLink extends Model<PaymentLink, PaymentLinkCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @Column({type: DataType.UUID, defaultValue: DataType.UUIDV4, unique: true})
    uuid: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    isUsed: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true, // Optional expiration date
    })
    expiresAt: Date;

    @Column({
        type: DataType.ARRAY(DataType.INTEGER),
        allowNull: true, // Set to true if the column is optional
    })
    monthsArray: number[];

    @HasOne(() => Order)
    order: Order;

    @ForeignKey(() => Admin)
    @Column({type: DataType.INTEGER, allowNull: false})
    adminId: number;

    @ForeignKey(() => Course)
    @Column({type: DataType.INTEGER, allowNull: false})
    courseId: number

    @BelongsTo(() => Course)
    course: Course

    @BelongsTo(() => Admin)
    admin: Admin;
}