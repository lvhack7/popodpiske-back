import { Table, Column, Model, DataType, HasMany, BelongsToMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
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
    @ApiProperty({ description: 'Уникальный идентификатор администратора', example: 1 })
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;
    
    @ApiProperty({ description: 'Логин администратора', example: 'admin123' })
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    login: string;

    @ApiProperty({ description: 'Пароль администратора', example: 'StrongPassword123' })
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password: string;

    @ApiProperty({ description: 'Роли администратора', type: [Roles] })
    @BelongsToMany(() => Roles, () => AdminRole)
    roles: Roles[];

    @ApiProperty({ description: 'Токены обновления администратора', type: [AdminRefreshToken] })
    @HasMany(() => AdminRefreshToken, { onDelete: 'CASCADE' })
    tokens: AdminRefreshToken[];
}