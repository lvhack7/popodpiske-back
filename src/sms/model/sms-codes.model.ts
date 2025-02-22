import { Table, Column, Model, DataType, BelongsTo, ForeignKey, AllowNull } from 'sequelize-typescript';
import { User } from 'src/users/model/user.model';

interface SMSCodesCreationAttrs {
    code: string
    expiresAt: Date
    token: string
    phone: string
}

@Table({ tableName: 'sms_codes' })
export class SMSCodes extends Model<SMSCodes, SMSCodesCreationAttrs> {

    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @Column({ type: DataType.STRING, allowNull: false })
    code: string;

    @Column({type: DataType.UUID, defaultValue: DataType.UUIDV4})
    token: string

    @Column({type: DataType.BOOLEAN, defaultValue: false})
    verified: boolean

    @Column({ type: DataType.DATE, allowNull: false })
    expiresAt: Date;

    @Column({type: DataType.TEXT, allowNull: false})
    phone: string
}