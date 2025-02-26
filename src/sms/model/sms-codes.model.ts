import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

interface SMSCodesCreationAttrs {
  code: string;
  expiresAt: Date;
  token: string;
  phone: string;
}

@Table({ tableName: 'sms_codes' })
export class SMSCodes extends Model<SMSCodes, SMSCodesCreationAttrs> {
  @ApiProperty({ description: 'Уникальный идентификатор кода СМС', example: 1 })
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

  @ApiProperty({ description: 'Дата истечения срока действия кода', example: '2025-02-25T00:00:00.000Z' })
  @Column({ type: DataType.DATE, allowNull: false })
  expiresAt: Date;

  @ApiProperty({ description: 'Номер телефона', example: '+7 (777) 123-45-67' })
  @Column({ type: DataType.TEXT, allowNull: false })
  phone: string;
}