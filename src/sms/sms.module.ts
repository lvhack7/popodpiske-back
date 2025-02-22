import { Module } from '@nestjs/common';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { SMSCodes } from './model/sms-codes.model';
import { UsersModule } from 'src/users/users.module';
import { ResetToken } from './model/reset-tokens.model';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [
    SequelizeModule.forFeature([SMSCodes, ResetToken]), 
    UsersModule,
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time-to-live (in seconds)
      limit: 10, // Maximum requests per ttl period per IP
    }]),
  ],
  controllers: [SmsController],
  providers: [SmsService ],
  exports: [SmsService]
})
export class SmsModule {}