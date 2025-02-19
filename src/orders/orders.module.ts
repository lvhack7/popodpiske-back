import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from './model/order.model';
import { PaymentLink } from '../links/model/payment-link.model';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { LinksModule } from 'src/links/links.module';

@Module({
  imports: [SequelizeModule.forFeature([Order, PaymentLink]),
  ConfigModule,
  UsersModule,
  PaymentsModule,
  LinksModule
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
