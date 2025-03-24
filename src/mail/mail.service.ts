import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { MailCodes } from './model/mail-codes.model';
import { InjectModel } from '@nestjs/sequelize';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordToken } from './model/reset-password-tokens.model';


@Injectable()
export class MailService {

    private logger = new Logger(MailService.name)

    constructor(
        @InjectModel(ResetPasswordToken)
        private readonly resetTokensModel: typeof ResetPasswordToken,
        @InjectModel(MailCodes)
        private readonly mailVerificationModel: typeof MailCodes,
        private readonly mailerService: MailerService
    ) {}

    private generateCode(): string {
        return Math.floor(10000 + Math.random() * 90000).toString(); // Generate a 5-digit code
    }

    async sendVerificationCode(email: string, emailType: 'registration' | 'passwordReset') {
        const code = this.generateCode();
        let subject: string;
        let messageText: string;
        let htmlBody: string;
      
        if (emailType === 'registration') {
          subject = 'Подтверждение аккаунта';
          messageText = `Поподписке. Ваш код подтверждения: ${code}`;
          htmlBody = `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
              <meta charset="UTF-8">
              <title>Подтверждение аккаунта</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f2f2f2;
                  color: #333;
                  padding: 20px;
                }
                .container {
                  background-color: #ffffff;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 30px;
                  border-radius: 5px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                  color: #0056b3;
                }
                .code {
                  font-size: 1.5em;
                  font-weight: bold;
                  color: #0056b3;
                  background-color: #e9f4fb;
                  padding: 10px;
                  text-align: center;
                  border-radius: 3px;
                  margin: 20px 0;
                }
                p {
                  line-height: 1.6;
                }
                .footer {
                  text-align: center;
                  font-size: 0.8em;
                  color: #777;
                  margin-top: 30px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Подтверждение аккаунта</h1>
                <p>Здравствуйте,</p>
                <p>Спасибо за регистрацию на Popodpiske.com! Чтобы завершить процесс регистрации, пожалуйста, введите следующий код подтверждения:</p>
                <div class="code">${code}</div>
                <p>Если вы не инициировали регистрацию, просто проигнорируйте это письмо.</p>
                <p>С уважением,<br>Команда поддержки</p>
              </div>
              <div class="footer">
                © 2025 Popodpiske.com. Все права защищены.
              </div>
            </body>
            </html>
          `;
        } else if (emailType === 'passwordReset') {
          subject = 'Сброс пароля';
          messageText = `Ваш код для сброса пароля: ${code}`;
          htmlBody = `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
              <meta charset="UTF-8">
              <title>Сброс пароля</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f2f2f2;
                  color: #333;
                  padding: 20px;
                }
                .container {
                  background-color: #ffffff;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 30px;
                  border-radius: 5px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h1 {
                  color: #0056b3;
                }
                .code {
                  font-size: 1.5em;
                  font-weight: bold;
                  color: #0056b3;
                  background-color: #e9f4fb;
                  padding: 10px;
                  text-align: center;
                  border-radius: 3px;
                  margin: 20px 0;
                }
                p {
                  line-height: 1.6;
                }
                .footer {
                  text-align: center;
                  font-size: 0.8em;
                  color: #777;
                  margin-top: 30px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Сброс пароля</h1>
                <p>Здравствуйте,</p>
                <p>Вы запросили сброс пароля. Пожалуйста, используйте следующий код для подтверждения запроса:</p>
                <div class="code">${code}</div>
                <p>Если вы не запрашивали сброс пароля, пожалуйста, свяжитесь с нашей службой поддержки.</p>
                <p>С уважением,<br>Команда поддержки</p>
              </div>
              <div class="footer">
                © 2025 Popodpiske.com. Все права защищены.
              </div>
            </body>
            </html>
          `;
        }
    
        try {
          await this.mailerService.sendMail({
            to: email,
            subject,
            text: messageText,
            html: htmlBody,
          });
      
          this.logger.log(`Verification code for ${email} is: ${code}`);
          await this.removeEmail(email);
          await this.mailVerificationModel.create({ email, code });
          return { message: 'Код успешно отправлен' };
        } catch (error) {
          this.logger.error(error);
          throw new InternalServerErrorException(
            'Не удалось отправить электронное письмо. Попробуйте еще раз.',
          );
        }
    }

    async verifyCode(code: string, email: string) {
        const record = await this.mailVerificationModel.findOne({ where: { code, email } });

        if (!record) {
            throw new BadRequestException("Неверный код, попробуйте еще раз");
        }

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        record.verified = true
        await record.save()

        const resetToken = await this.resetTokensModel.create({
            email,
            expiresAt
        })

        return resetToken
    }

    async findVerified(email: string) {
        return await this.mailVerificationModel.findOne({where: {email, verified: true}})
    }

    async removeEmail(email: string) {
        await this.mailVerificationModel.destroy({ where: {email} })
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
