import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './model/order.model';
import { CreateOrderDto } from './dto/create-order.dto';
import { UsersService } from 'src/users/users.service';
import axios from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from 'src/payments/payments.service';
import { v4 as uuidv4 } from 'uuid';
import { PaymentLinkService } from 'src/links/links.service';
import { getNextBillingDate } from 'src/common/utils';


@Injectable()
export class OrdersService {

    private logger = new Logger(OrdersService.name)

    constructor(
        @InjectModel(Order) private orderModel: typeof Order,
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
        private readonly linkService: PaymentLinkService,
        private readonly paymentService: PaymentsService
    ) {}

    async createOrder(dto: CreateOrderDto, userId: number) {
        const user = await this.userService.getUserById(userId)
        const link = await this.linkService.getPaymentLinksByUUID(dto.linkUUID)
        
        const paymentId = uuidv4()
        const currentDate = new Date().toISOString().split('T')[0];

        const [order, created] = await this.orderModel.findOrCreate({
            where: {
              // Add the condition that uniquely identifies the record you're searching for
              userId, 
              linkId: link.id,
            },
            defaults: {
              ...dto, // Spread other values here for creating a new record
              remainingMonth: dto.numberOfMonths,
              paymentId,
              linkId: link.id,
              nextBillingDate: currentDate,
              status: 'pending',
            },
        });

        if (created) {
            order.paymentId = paymentId
            await order.save()
        }

        const data = await this.generatePaymentLink(
            link.course.courseName,
            dto.monthlyPrice,
            paymentId,
            user.email,
            user.phone,
            `Оплата за первый месяц курса ${link.course.courseName}`,
            true
        )

        order.recurrentToken = data.recurrent_token
        await order.save()

        return {
            paymentUrl: data.payment_page_url,
        }
    }

    async successOrder(linkId: string) {
        const link = await this.linkService.getPaymentLinksByUUID(linkId)
        if (!link) {
            throw new BadRequestException("Ссылка не найдена")
        }

        const order = await this.orderModel.findOne({where: {linkId: link.id}})
        if (!order) {
            throw new BadRequestException("Заказ не найден")
        }

        order.status = 'active'
        order.remainingMonth -= 1

        let nextBillingDate = getNextBillingDate(order.nextBillingDate)
        order.nextBillingDate = nextBillingDate;

        await order.save()
        
        await this.paymentService.createPayment({
            amount: order.monthlyPrice,
            orderId: order.id,
            status: 'success',
            currency: 'KZT',
            paymentDate: new Date(),
        })
    }

    async cancelOrder(orderId: number, userId: number) {
        const order = await this.orderModel.findOne({where: { id: orderId, userId: userId }})
        if (!order) {
            throw new NotFoundException("Прдписка на курс не найдена")
        }

        order.status = "cancelled"
        await order.save()
    }

    async getCallback(orderId: string, dto: any) {
        const order = await this.orderModel.findOne({where: {paymentId: orderId}})
        this.logger.log("DTO: ", dto)
    }

    async getOrders(userId: number) {
        console.log("USERRRR: ", userId)
        return await this.orderModel.findAll({
            where: {userId}, 
            include: [
                {
                    all: true,
                    nested: true,
                },
            ],
            order: [['id', 'ASC']],
        })
    }

    async getAdminOrders(adminId: number) {
        const links = await this.linkService.getPaymentLinks(adminId);
        const orders: Order[] = [];

        for (const link of links) {
            const order = await this.orderModel.findOne({
                where: { linkId: link.id },
                include: [{ all: true, nested: true }],
            });
            if (order) {
                orders.push(order);
            }
        }

        // Sort orders by id in ascending order
        orders.sort((a, b) => a.id - b.id);

        return orders;
    }

    async getAllOrders() {
        const orders =  await this.orderModel.findAll({
            include: [
                {
                    all: true,
                    nested: true,
                },
            ],
            order: [['id', 'ASC']],
        });
        console.log("ORDERS: ", orders.length)

        return orders
    }

    async deleteOrder(orderId: number, userId: number) {
        const order = await this.orderModel.findOne({where: {id: orderId, userId}})

        if (!order) {
            throw new BadRequestException("Заказ не найден")
        }

        await order.destroy()
    }

    async deactivateOrder(orderId: number, userId: number) {
        const order = await this.orderModel.findOne({where: {id: orderId, userId}})

        if (!order) {
            throw new BadRequestException("Заказ не найден")
        }

        order.status = "inactive"
        await order.save()
    }

    private async generatePaymentLink(
        courseName: string,
        amount: number,
        orderId: string,
        userEmail: string,
        phone: string,
        description: string,
        createRecurrent = true,
    ): Promise<any> {
        // 1) Prepare the payment body (matching the structure from your screenshot)
        const paymentBody = {
          amount,                        // e.g. 10
          currency: 'KZT',              // or other supported currency
          order_id: orderId,            // must be unique
          description,                  // your description
          payment_type: 'pay',          // from the example
          payment_method: 'ecom',         // from the example
          items: [
            {
                merchant_id: this.configService.get('PAYSAGE_MERCHANT_ID'),
                service_id: this.configService.get('PAYSAGE_SERVICE_ID'),
                merchant_name: this.configService.get('PAYSAGE_MERCHANT_NAME'),
                name: courseName,
                quantity: 1,
                amount_one_pcs: amount,
                amount_sum: amount
            }
          ],                    // optional array of items
          user_id: 'some-user-id',      // or your internal user reference
          email: userEmail,
          phone,
          success_url: `https://popodpiske.com/success`, // adjust to your domain
          failure_url: `https://popodpiske.com/failure`,
          callback_url: `https://api.popodpiske.com/orders/callback/${orderId}`,
          payment_lifetime: 3600,
          create_recurrent_profile: true, // true or false
          recurrent_profile_lifetime: 400,
          lang: 'ru',
          extra_params: {},
        };
        console.log(paymentBody)
    
        // 2) Convert paymentBody -> JSON string -> base64
        const dataString = JSON.stringify(paymentBody);
        const dataBase64 = Buffer.from(dataString).toString('base64');
    
        // 3) Generate signature (HMAC-SHA512)
        const sign = crypto
          .createHmac('sha512', this.configService.get('PAYSAGE_SECRET_KEY'))
          .update(dataBase64)
          .digest('hex');
    
        // 4) Create the Bearer token from your apiKey
        const token = Buffer.from(this.configService.get('PAYSAGE_API_KEY')).toString('base64');
    
        // 5) Make the POST request to Paysage
        try {
            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            };
        
            const paysageResponse = await axios.post(
                'https://api.paysage.kz/payment/create',
                { data: dataBase64, sign },
                { headers },
            );

            console.log("PAYSAGE RESPONSE: ", paysageResponse)
            console.log("PAYSAGE RESPONSE DATA: ", paysageResponse.data)
            const { data } = paysageResponse;
            const jsonData = JSON.parse(Buffer.from(data.data, 'base64').toString('utf-8'));
            console.log("DATA: ", jsonData)
            return jsonData;
            // 86864428359842110
        } catch (error) {
            console.error(error)
            // If there's an error from Paysage, log or rethrow
            throw new InternalServerErrorException('Не получилось подключиться к платежной системе, попробуйте позже');
        }
    } 
}