import {AllowNull, BelongsToMany, Column, DataType, Model, Table} from "sequelize-typescript";
import { AdminRole } from "./admin-role.model";
import { Admin } from "src/admin/model/admin.model";


interface RolesCreationAttrs {
    value: string;
    label: string
}

@Table({tableName: 'roles'})
export class Roles extends Model<Roles, RolesCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number

    @Column({type: DataType.STRING, unique: true, allowNull: false})
    value: string;

    @Column({type: DataType.STRING, allowNull: true})
    label: string
    
    @BelongsToMany(() => Admin, () => AdminRole)
    admins: Admin[];
}