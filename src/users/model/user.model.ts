import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { RefreshToken } from "./refresh-token.model";
import { Order } from "src/orders/model/order.model";
import { ApiProperty } from '@nestjs/swagger';

export interface UserCreationAttrs {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  iin: string;
  password?: string;
  status?: "Pending" | "Verified" | "Active";
}

@Table({ tableName: 'user', timestamps: true })
export class User extends Model<User, UserCreationAttrs> {
  @ApiProperty({ description: 'Уникальный идентификатор пользователя', example: 1 })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ description: 'Имя пользователя', example: 'Иван' })
  @Column({ type: DataType.TEXT, allowNull: false })
  firstName: string;

  @ApiProperty({ description: 'Фамилия пользователя', example: 'Иванов' })
  @Column({ type: DataType.TEXT, allowNull: false })
  lastName: string;

  @ApiProperty({ description: 'Электронная почта пользователя', example: 'ivanov@example.com', required: false })
  @Column({ type: DataType.TEXT, allowNull: true })
  email: string;

  @ApiProperty({ description: 'Номер телефона пользователя', example: '+7 (777) 123-45-67' })
  @Column({ type: DataType.TEXT, allowNull: false })
  phone: string;

  @ApiProperty({ description: 'ИИН пользователя', example: '123456789012' })
  @Column({ type: DataType.TEXT, allowNull: false })
  iin: string;

  @ApiProperty({ description: 'Пароль пользователя', example: 'StrongPassword123', required: false })
  @Column({ type: DataType.TEXT, allowNull: true })
  password: string;

  @ApiProperty({ description: 'Статус пользователя', example: 'New', default: 'New' })
  @Column({ type: DataType.TEXT, defaultValue: "New" })
  status: string;

  @ApiProperty({ description: 'Заказы пользователя', type: () => [Order] })
  @HasMany(() => Order)
  orders: Order[];

  @ApiProperty({ description: 'Токены обновления пользователя', type: () => [RefreshToken] })
  @HasMany(() => RefreshToken)
  tokens: RefreshToken[];
}