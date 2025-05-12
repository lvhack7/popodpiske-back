// payments.cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Order } from '../orders/model/order.model';
import { PaymentsService } from './payments.service';
import { Payment } from './model/payment.model';
import { getNextBillingDate } from 'src/common/utils';


@Injectable()
export class SchedulePaymentService {
    private readonly logger = new Logger(SchedulePaymentService.name);

    constructor(
        @InjectModel(Order)
        private orderModel: typeof Order,
        @InjectModel(Payment)
        private paymentModel: typeof Payment,
        private paymentService: PaymentsService
    ) {}

    public async runRecurrentPaymentForOrder(orderId: number): Promise<void> {
        this.logger.log(`Manually running recurrent payment for Order #${orderId}, ignoring nextBillingDate.`);
    
        // 1) Find the order by ID
        const order = await this.orderModel.findOne({ where: { id: orderId } });
        if (!order) {
          this.logger.warn(`Order #${orderId} not found. Skipping.`);
          return;
        }
    
        // 2) Basic checks
        if (!order.recurrentToken) {
          this.logger.warn(`Order #${orderId} has no recurrentToken. Cannot charge.`);
          return;
        }
        // if (order.status !== 'active') {
        //   this.logger.warn(`Order #${orderId} is not active (status=${order.status}). Skipping.`);
        //   return;
        // }
        if (order.remainingMonth <= 0) {
          this.logger.warn(`Order #${orderId} has no remaining months (=${order.remainingMonth}). Skipping.`);
          return;
        }
    
        // 3) Attempt to charge
        try {
          const amount = Number(order.monthlyPrice) || 0;
          const result = await this.paymentService.chargeRecurrent(
            order.recurrentToken,
            amount,
              // or any unique ID recognized by Paysage
          );
          console.log("RESULT: ", result)
          // result should have something like { status: 'success' | 'fail' }
          if (result.status === 'success') {
            // a) Create a payment record
            await this.paymentModel.create({
              orderId: order.id,
              amount,
              currency: 'KZT',
              status: 'success',
              transactionId: result.paymentId,
              paymentDate: new Date(),
            });
    
            this.logger.log(`Order #${order.id} payment successful (Manual run).`);
    
            // b) Decrement remainingMonth
            order.remainingMonth -= 1;
            if (order.remainingMonth <= 0) {
              order.status = 'completed';
              order.nextBillingDate = null;
            } else {
              // Optionally set the nextBillingDate if you want 
              // to keep the monthly cycle going
              const nextDate = new Date();
              nextDate.setMonth(nextDate.getMonth() + 1);
              order.nextBillingDate = nextDate.toISOString().split('T')[0];
            }
            await order.save();
          } else {
            // Payment failed or some error
            this.logger.warn(`Order #${order.id} payment failed (Manual run).`);
            await this.paymentModel.create({
              orderId: order.id,
              amount,
              currency: 'KZT',
              status: 'failed',
              paymentDate: new Date(),
            });
    
            // Mark the order as 'past_due' or 'failed'
            order.status = 'past_due';
            // Possibly move nextBillingDate to tomorrow if you want a retry
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            order.nextBillingDate = tomorrow.toISOString().split('T')[0];
    
            await order.save();
          }
        } catch (err) {
          this.logger.error(`Error charging order #${order.id} (Manual run): ${err}`);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_10PM)
    async handleRecurrentPayments() {
      this.logger.log('🔄 Running recurrent payment check…');

      const todayStr   = new Date().toISOString().split('T')[0];
      const MS_PER_DAY = 24 * 60 * 60 * 1000;

      const dueOrders = await this.orderModel.findAll({
        where: {
          recurrentToken:  { [Op.ne]: null },
          nextBillingDate: { [Op.lte]: todayStr },
          status:          { [Op.in]: ['active','past_due'] },
          remainingMonth:  { [Op.gt]:  0 },
        },
      });

      for (const order of dueOrders) {
        const scheduledDate = new Date(order.nextBillingDate);
        if (isNaN(scheduledDate.getTime())) {
          this.logger.error(
            `Order #${order.id}: invalid nextBillingDate (${order.nextBillingDate})`
          );
          continue;
        }

        const daysPast = Math.floor(
          (Date.now() - scheduledDate.getTime()) / MS_PER_DAY
        );
        if (order.status === 'past_due' && daysPast >= 10) {
          this.logger.warn(
            `Order #${order.id} has been past due for ${daysPast} days — cancelling subscription.`
          );
          order.status = 'cancelled';
          order.remainingMonth = 0;
          order.nextBillingDate = null;
          order.recurrentToken = null;
          await order.save();
          continue;
        }

        const amount = Number(order.monthlyPrice) || 0;

        try {
          const result = await this.paymentService.chargeRecurrent(
            order.recurrentToken,
            amount,
          );

          if (result.status !== "success") throw new Error('payment not successful');

          // 6) Record successful payment
          await this.paymentModel.create({
            orderId:       order.id,
            amount,
            currency:      'KZT',
            status:        'success',
            paymentDate:   new Date(),
            transactionId: result.paymentId,
          });

          // 7) Advance subscription
          order.remainingMonth = Math.max(0, order.remainingMonth - 1);
          if (order.remainingMonth > 0) {
            order.status = 'active';
            order.nextBillingDate = getNextBillingDate(order.nextBillingDate);
          } else {
            order.status = 'completed';
            order.nextBillingDate = null;       // clear when done
            order.recurrentToken = null;
          }

          await order.save();
          this.logger.log(`✅ Order #${order.id}: payment succeeded`);
        } catch (err: any) {
          // 8) Record failure and mark past_due
          await this.paymentModel.create({
            orderId:     order.id,
            amount,
            currency:    'KZT',
            status:      'failed',
            paymentDate: new Date(),
          });

          order.status = 'past_due';
          // nextBillingDate remains unchanged so it'll retry tomorrow
          await order.save();
          this.logger.error(
            `❌ Order #${order.id}: payment failed (${err.message})`
          );
        }
      }
    }

    /**
     * Helper method to compute next month's date
     * Handling potential edge cases if date is near end of month.
     * If nextBillingDate is a DATE-ONLY string (e.g. "2025-01-31"), parse & add a month
     */
    // private computeNextMonthDate(baseDate: string | Date): string {
    //     // 1) Convert to a real Date
    //     let dateObj: Date;
    //     if (typeof baseDate === 'string') {
    //         dateObj = new Date(baseDate + 'T00:00:00'); 
    //     } else {
    //         dateObj = new Date(baseDate);
    //     }

    //     // 2) Add 1 month 
    //     const nextDate = new Date(dateObj);
    //     nextDate.setMonth(nextDate.getMonth() + 1);

    //     // 3) If your DB stores nextBillingDate as DATEONLY, return YYYY-MM-DD
    //     //    Otherwise, you can return a full ISO date
    //     return nextDate.toISOString().split('T')[0];
    // }
}