import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';


interface MailCodesCreationAttrs {
  code: string;
  token: string;
  email: string;
}

@Table({ tableName: 'mail_codes' })
export class MailCodes extends Model<MailCodes, MailCodesCreationAttrs> {
  @ApiProperty({ description: 'Уникальный идентификатор кода', example: 1 })
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({ description: 'Проверочный код', example: '123456' })
  @Column({ type: DataType.STRING, allowNull: false })
  code: string;

  @ApiProperty({ description: 'Токен для проверки', example: 'a1b2c3d4-e5f6-7g8h-9i0j', required: false })
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  token: string;

  @ApiProperty({ description: 'Флаг проверки кода', example: false })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  verified: boolean;

  @ApiProperty({ description: 'Почта', example: 'mail@mail.com' })
  @Column({ type: DataType.TEXT, allowNull: false })
  email: string;
}