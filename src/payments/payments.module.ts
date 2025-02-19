import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Payment } from './model/payment.model';
import { OrdersModule } from 'src/orders/orders.module';
import { Order } from 'src/orders/model/order.model';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulePaymentService } from './schedule.service';

@Module({
  imports: [ScheduleModule.forRoot(), SequelizeModule.forFeature([Payment, Order])],
  controllers: [PaymentsController],
  providers: [PaymentsService, SchedulePaymentService],
  exports: [PaymentsService]
})
export class PaymentsModule {}
