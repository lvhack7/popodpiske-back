import { Table, Column, Model, DataType, HasMany, BelongsTo, BelongsToMany } from 'sequelize-typescript';
import { AdminRole } from 'src/roles/model/admin-role.model';
import { Roles } from 'src/roles/model/role.model';
import { AdminRefreshToken } from './admin-refresh-token.model';


export interface AdminCreationAttrs {
    login: string;
    password: string;
}

@Table({
    tableName: 'admin',
    timestamps: true,
})
export class Admin extends Model<Admin> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number
    
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    login: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password: string;

    @BelongsToMany(() => Roles, () => AdminRole)
    roles: Roles[];

    @HasMany(() => AdminRefreshToken, {onDelete: 'CASCADE'})
    tokens: AdminRefreshToken[]
}