import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './model/payment.model';
import { CreatePaymentDto } from './dto/create-payment.dto';
import axios from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class PaymentsService {

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
        // 1) Prepare token
        const bearerToken = Buffer.from(this.configService.get('PAYSAGE_API_KEY')).toString('base64');
    
        // 2) Body for /payment/recurrent
        const body = {
          token: recurrentToken,
          amount,
          order_id: uuidv4(),
          description: 'Оплата за курс', 
          test_mode: 1
        };
        console.log(body)
    
        // 3) Convert to base64
        const dataString = JSON.stringify(body);
        const dataBase64 = Buffer.from(dataString).toString('base64');
    
        // 4) Sign (HMAC-SHA512)
        const sign = crypto
          .createHmac('sha512', this.configService.get('PAYSAGE_SECRET_KEY'))
          .update(dataBase64)
          .digest('hex');
    
        // 5) Send POST to Paysage
        try {
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${bearerToken}`,
            };
        
            const { data, status } = await axios.post(
                'https://api.paysage.kz/payment/recurrent',
                { data: dataBase64, sign },
                { headers },
            );

            const jsonData = JSON.parse(Buffer.from(data.data, 'base64').toString('utf-8'));

            console.log(jsonData)
            if (status === 200) {
                return {status: "success", message: "Оплата прошла успешно", paymentId: jsonData.payment_id};
            } else {  
                return {status: "error", message: data?.data?.error_msg || 'Ошибка при оплате'};
            }
        } catch (error: any) {
            console.error(error);
            return {status: "error", message: error.data.error_msg || 'Ошибка при оплате'};
        }
    }

}
