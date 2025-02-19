
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { User } from "./user.model";


interface RefreshTokenAttrs {
    token: string
    userId: number
}

@Table({tableName: 'refresh-token'})
export class RefreshToken extends Model<RefreshToken, RefreshTokenAttrs> {

    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @Column({type: DataType.TEXT, unique: true, allowNull: false})
    token: string

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER, allowNull: false})
    userId: number
    
    @BelongsTo(() => User)
    user: User
}
