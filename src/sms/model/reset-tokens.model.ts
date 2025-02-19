import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'reset_tokens',
    timestamps: true,
})
export class ResetToken extends Model<ResetToken> {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    phone: string;

    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4
    })
    token: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    expiresAt: Date;
}