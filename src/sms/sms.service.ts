import { Injectable, HttpException, HttpStatus, BadRequestException, Logger } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/sequelize';
import { SMSCodes } from './model/sms-codes.model';
import { ResetToken } from './model/reset-tokens.model';


@Injectable()
export class SmsService {
    private logger = new Logger(SmsService.name)

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
        const message = `Popodpiske. Ваш код подтверждения: ${code}`;
    
        const login = process.env.SMS_LOGIN; // Replace with your SMSC.kz login
        const password = process.env.SMS_PASSWORD; // Replace with your SMSC.kz password
        //const sender = process.env.SMS_SENDER;

        const url = `https://smsc.kz/sys/send.php?login=${login}&psw=${password}&phones=${phone.replace("+", "")}&mes=${encodeURIComponent(message)}`;

        try {
            const response = await axios.get(url);
            if (response.data.includes('ERROR')) {
                throw new HttpException('Не получилось отправить код', HttpStatus.BAD_REQUEST);
            }

            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getSeconds() + 80); // Code expires in 1 minute

            this.logger.log("The code is: " + code)
            await this.removePhone(phone)
            await this.smsVerificationModel.create({ phone, code, expiresAt });
            return { message: 'Код успешно отправлен'};
        } catch (error) {
            console.log(error)
            throw new HttpException(
                'Не удалось отправить СМС. Попробуйте еще раз.',
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