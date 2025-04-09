import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './model/payment.model';
import { CreatePaymentDto } from './dto/create-payment.dto';
import axios from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        private configService: ConfigService,
        @InjectModel(Payment) private paymentModel: typeof Payment
    ) {}

    async createPayment(dto: CreatePaymentDto) {
        return await this.paymentModel.create(dto);
    }

    async getOrderPayments(orderId: number) {
        return await this.paymentModel.findAll({where: {orderId}, order: [['id', 'ASC']],});
    }

    async chargeRecurrent(recurrentToken: string, amount: number) {
        // 1) Prepare API bearer token
        const paysApiKey = this.configService.get('PAYSAGE_API_KEY');
        const bearerToken = Buffer.from(paysApiKey).toString('base64');
      
        // 2) Prepare the body for /payment/recurrent
        const body = {
          token: recurrentToken,
          amount,
          order_id: uuidv4(), // Ensure you have imported uuidv4 from the uuid package.
          description: 'Оплата за курс',
        };
      
        // 3) Convert body to a base64 string
        const dataString = JSON.stringify(body);
        const dataBase64 = Buffer.from(dataString).toString('base64');
      
        // 4) Sign the data with HMAC-SHA512
        const secretKey = this.configService.get('PAYSAGE_SECRET_KEY');
        const sign = crypto
          .createHmac('sha512', secretKey)
          .update(dataBase64)
          .digest('hex');
      
        // 5) Send POST request to Paysage API
        try {
          const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearerToken}`,
          };
      
          const { data, status } = await axios.post(
            'https://api.paysage.kz/payment/recurrent',
            { data: dataBase64, sign },
            { headers }
          );
      
          // Log raw response for debugging
          this.logger.log(`Raw response data: ${JSON.stringify(data)}`);
          this.logger.log(`Status from Paysage: ${status}`);
      
          // Decode the base64 encoded response data.
          let jsonData;
          try {
            jsonData = JSON.parse(Buffer.from(data.data, 'base64').toString('utf-8'));
          } catch (decodeError) {
            this.logger.error(`Error decoding response data for recurrent payment: ${decodeError}`);
            throw new Error('Decoding response failed');
          }
          this.logger.log(`Decoded JSON from Paysage: ${JSON.stringify(jsonData)}`);
      
          // Check for HTTP 200 status.
          if (status === 200) {
            return {
              status: "success",
              message: "Оплата прошла успешно",
              paymentId: jsonData.payment_id,
            };
          } else {
            return {
              status: "error",
              message: data?.data?.error_msg || 'Ошибка при оплате',
            };
          }
        } catch (error: any) {
          this.logger.error(`Error while charging recurrent payment for token ${recurrentToken}: ${error}`);
          return {
            status: "error",
            message: error?.response?.data?.error_msg || 'Ошибка при оплате',
          };
        }
    }

}
