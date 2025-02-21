import { Table, Column, Model, DataType, HasMany, BelongsTo, BelongsToMany } from 'sequelize-typescript';
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
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        unique: true,
    })
    courseName: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    totalPrice: number;

    @HasMany(() => PaymentLink)
    links: PaymentLink[];
}