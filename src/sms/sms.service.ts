import { Injectable, HttpException, HttpStatus, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/sequelize';
import { SMSCodes } from './model/sms-codes.model';
import { ResetToken } from './model/reset-tokens.model';


@Injectable()
export class SmsService {
    private logger = new Logger(SmsService.name)
    private readonly token = process.env.WA_KEY; // set in .env
    private readonly channelId = process.env.WA_CHANNEL; // set in .env
    private readonly baseUrl = 'https://api.wazzup24.com/v3';

    constructor(
        @InjectModel(ResetToken)
        private readonly resetTokensModel: typeof ResetToken,
        @InjectModel(SMSCodes)
        private readonly smsVerificationModel: typeof SMSCodes,
    ) {}

    private generateCode(): string {
        return Math.floor(10000 + Math.random() * 90000).toString(); // Generate a 5-digit code
    }

    async sendVerificationCode(phone: string) {
        const code = this.generateCode();
        const message = `Popodpiske.com. Ваш код подтверждения: ${code}`;
    
        try {
          const response = await axios.post(
            `${this.baseUrl}/message`,
            { 
                channelId: this.channelId,
                chatId: phone.replace('+', ''),
                chatType: "whatsapp",
                text: message
            },
            {
              headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
              },
            },
          );
    
          // Check if Wazzup responded with success
          if (!response.data || response.data.error) {
            throw new HttpException(
              'Не получилось отправить код через WhatsApp',
              HttpStatus.BAD_REQUEST,
            );
          }
    
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 1); // 1 minute expiry
    
          this.logger.log('The code is: ' + code);
          await this.removePhone(phone);
          await this.smsVerificationModel.create({ phone, code, expiresAt });
    
          return { message: 'Код успешно отправлен через WhatsApp' };
        } catch (error) {
          this.logger.error('Ошибка при отправке через Wazzup:', error.response?.data || error.message);
          throw new HttpException(
            'Не удалось отправить сообщение. Попробуйте еще раз.',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
    }

    async verifyCode(code: string, phone: string) {
        const record = await this.smsVerificationModel.findOne({ where: { code, phone } });

        if (!record) {
            throw new BadRequestException("Неверный код, попробуйте еще раз");
        }

        const now = new Date();
        if (now > record.expiresAt) {
            await record.destroy();
            throw new BadRequestException("Код истек")
        }

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        record.verified = true
        await record.save()

        const resetToken = await this.resetTokensModel.create({
            phone,
            expiresAt
        })

        return resetToken
    }

    async findVerified(phone: string) {
        return await this.smsVerificationModel.findOne({where: {phone, verified: true}})
    }

    async removePhone(phone: string) {
        await this.smsVerificationModel.destroy({ where: {phone} })
    }

    async getRecordByToken(token: string) {
        const record = await this.resetTokensModel.findOne({where: {token}})

        const now = new Date();
        if (now > record.expiresAt) {
            await record.destroy();
            return null
        }

        return record
    }
}