import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './model/order.model';
import { CreateOrderDto } from './dto/create-order.dto';
import { UsersService } from 'src/users/users.service';
import axios, { all } from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from 'src/payments/payments.service';
import { v4 as uuidv4 } from 'uuid';
import { PaymentLinkService } from 'src/links/links.service';
import { getNextBillingDate } from 'src/common/utils';
import { SmsService } from 'src/sms/sms.service';


@Injectable()
export class OrdersService {

    private logger = new Logger(OrdersService.name)

    constructor(
        @InjectModel(Order) private orderModel: typeof Order,
        private readonly userService: UsersService,
        private readonly configService: ConfigService,
        private readonly linkService: PaymentLinkService,
        private readonly paymentService: PaymentsService,
        private readonly smsService: SmsService
    ) {}

    async createOrder(dto: CreateOrderDto, userId: number) {
        const user = await this.userService.getUserById(userId)
        const link = await this.linkService.getPaymentLinksByUUID(dto.linkUUID)

        if (!link) {
            throw new BadRequestException("Ссылка не найдена")
        }

        const smsVerified = await this.smsService.findVerified(user.phone)
        if (!smsVerified) {
            throw new BadRequestException("Телефон не был подтвержден!")
        }

        const paymentId = uuidv4()

        const order = await this.orderModel.create({
            ...dto, // Spread other values here for creating a new record
            userId, 
            linkId: link.id,
            remainingMonth: dto.numberOfMonths,
            courseName: link.course.courseName,
            totalPrice: link.course.totalPrice,
            paymentId,
            status: 'pending',
        });

        const data = await this.generatePaymentLink(
            link.course.courseName,
            dto.monthlyPrice,
            paymentId,
            user.email,
            user.phone,
            `Оплата за первый месяц курса ${link.course.courseName}`,
        )

        order.recurrentToken = data.recurrent_token
        await order.save()

        link.isUsed = true
        await link.save()

        return {
            paymentUrl: data.payment_page_url,
        }
    }

    async addPayment(orderId: string, userId: number) {
        const order = await this.orderModel.findOne({where: {paymentId: orderId, userId}, include: [{all: true, nested: true}]})
        if (!order) {
            throw new BadRequestException("Заказ не найден")
        }

        const newPaymentId = uuidv4()
        order.paymentId = newPaymentId

        this.logger.log("PAYMENT: ")

        const data = await this.generatePaymentLink(
            order.link.course.courseName,
            Number(order.monthlyPrice),
            newPaymentId,
            order.user.email,
            order.user.phone,
            `Оплата за первый месяц курса ${order.link.course.courseName}`,
        )

        order.recurrentToken = data.recurrent_token
        await order.save()

        return {
            paymentUrl: data.payment_page_url,
        }
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
        // Fetch the order and include the associated user.
        const order = await this.orderModel.findOne({
          where: { paymentId: orderId },
          include: {all: true},
        });
        if (!order) {
          throw new BadRequestException("Заявка не найдена");
        }
      
        const currentDate = new Date();
        const dateFormatted = currentDate.toISOString().split('T')[0];
      
        // Decode and parse the incoming JSON data.
        const decodedData = Buffer.from(dto.data, 'base64').toString('utf-8');
        const jsonData = JSON.parse(decodedData);
      
        // Log the raw and processed operation_status.
        this.logger.log("ORDER ID: ", orderId)
        this.logger.log("CALLBACK raw:", jsonData.operation_status);
        const operationStatus = String(jsonData.operation_status).trim().toLowerCase();
        this.logger.log("CALLBACK processed:", operationStatus);
      
        // Check if the operation_status equals "success".
        if (operationStatus === "success") {
          if (order.user && order.user.phone) {
            await this.smsService.removePhone(order.user.phone);
          } else {
            this.logger.warn("User phone not available on order");
          }
      
          order.remainingMonth -= 1;
      
          // Update order status based on remainingMonth.
          if (order.remainingMonth === 0) {
            order.status = "completed";
          } else {
            order.status = "active";
            // Calculate the next billing date.
            const nextBillingDate = getNextBillingDate(dateFormatted);
            order.nextBillingDate = nextBillingDate;
          }
      
          await order.save();
      
          // Create a payment record.
          await this.paymentService.createPayment({
            amount: order.monthlyPrice,
            orderId: order.id,
            status: 'success',
            currency: 'KZT',
            paymentDate: currentDate,
          });
        } else {
          this.logger.warn(`Operation status is not success: ${operationStatus}`);
        }
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

        // for (const order of orders) {
        //     // Check that order.link and order.link.course exist and that courseName is available
        //     if (!order.courseName && order.link && order.link.course && order.link.course.courseName) {
        //         order.courseName = order.link.course.courseName;
        //         await order.save();  // Persist the change to the database
        //     }
        // }

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
          success_url: `https://popodpiske.com/dashboard`, // adjust to your domain
          failure_url: `https://popodpiske.com/failure/${orderId}`,
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
        } catch (error) {
            console.error(error)
            // If there's an error from Paysage, log or rethrow
            throw new InternalServerErrorException('Не получилось подключиться к платежной системе, попробуйте позже');
        }
    } 
}