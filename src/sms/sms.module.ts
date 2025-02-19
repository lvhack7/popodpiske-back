import { Module } from '@nestjs/common';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { SMSCodes } from './model/sms-codes.model';
import { UsersModule } from 'src/users/users.module';
import { ResetToken } from './model/reset-tokens.model';
import { RateLimiterModule } from 'nestjs-rate-limiter';

@Module({
  imports: [
    RateLimiterModule.register({
      points: 5, // Number of points
      duration: 60, // Per second(s)
    }),
    SequelizeModule.forFeature([SMSCodes, ResetToken]), 
    UsersModule
  ],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService]
})
export class SmsModule {}