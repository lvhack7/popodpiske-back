import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'reset_password_tokens',
    timestamps: true,
})
export class ResetPasswordToken extends Model<ResetPasswordToken> {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    email: string;

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