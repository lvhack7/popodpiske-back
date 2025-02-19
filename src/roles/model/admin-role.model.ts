import {Column, DataType, ForeignKey, Model, PrimaryKey, Table, Unique} from "sequelize-typescript";
import { Roles } from "./role.model";
import { User } from "src/users/model/user.model";
import { Admin } from "src/admin/model/admin.model";


@Table({tableName: 'admin_role', createdAt: false, updatedAt: false})
export class AdminRole extends Model<AdminRole> {

    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @ForeignKey(() => Roles)
    @Column({type: DataType.INTEGER})
    roleId: number;

    @ForeignKey(() => Admin)
    @Column({type: DataType.INTEGER})
    adminId: number;
}