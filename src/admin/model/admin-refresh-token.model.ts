
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Admin } from "./admin.model";


interface AdminRefreshTokenAttrs {
    token: string
    adminId: number
}

@Table({tableName: 'admin-refresh-token'})
export class AdminRefreshToken extends Model<AdminRefreshToken, AdminRefreshTokenAttrs> {

    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @Column({type: DataType.TEXT, unique: true, allowNull: false})
    token: string

    @ForeignKey(() => Admin)
    @Column({type: DataType.INTEGER, allowNull: false})
    adminId: number
    
    @BelongsTo(() => Admin)
    admin: Admin
}
