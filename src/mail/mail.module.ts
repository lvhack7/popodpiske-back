import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Sequelize } from 'sequelize';
import { ResetPasswordToken } from './model/reset-password-tokens.model';
import { MailCodes } from './model/mail-codes.model';
import { SequelizeModule } from '@nestjs/sequelize';


@Module({
  imports: [
    SequelizeModule.forFeature([ResetPasswordToken, MailCodes]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.popodpiske.com', // your SMTP host
        port: 587,                // your SMTP port (usually 587 for TLS)
        secure: false,            // true for port 465, false for other ports
        auth: {
          user: process.env.EMAIL_ADDRESS, // your SMTP username
          pass: process.env.EMAIL_PASSWORD,         // your SMTP password
        },
      },
    })
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
