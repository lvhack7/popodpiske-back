import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { RolesModule } from './roles/roles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { SmsModule } from './sms/sms.module';
import { User } from './users/model/user.model';
import { Order } from './orders/model/order.model';
import { Roles } from './roles/model/role.model';
import { SMSCodes } from './sms/model/sms-codes.model';
import { AdminRole } from './roles/model/admin-role.model';
import { RefreshToken } from './users/model/refresh-token.model';
import { PaymentLink } from './links/model/payment-link.model';
import { Payment } from './payments/model/payment.model';
import { AdminModule } from './admin/admin.module';
import { Admin } from './admin/model/admin.model';
import { AdminRefreshToken } from './admin/model/admin-refresh-token.model';
import { LinksModule } from './links/links.module';
import { CoursesModule } from './courses/courses.module';
import { Course } from './courses/model/course.model';
import { ResetToken } from './sms/model/reset-tokens.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('DATABASE_HOST');
        const port = configService.get<number>('DATABASE_PORT');
        const username = configService.get<string>('DATABASE_USER');
        const password = configService.get<string>('DATABASE_PASSWORD');
        const database = configService.get<string>('DATABASE_NAME');

        console.log(host, port, username, password, database);

        return {
          dialect: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadModels: true,
          synchronize: true,
          //sync: { alter: true },
          models: [User, Order, Roles, SMSCodes, AdminRole, Admin, RefreshToken, Payment, PaymentLink, ResetToken, AdminRefreshToken, Course],
        };
      },
      inject: [ConfigService],
    }),
    UsersModule, AuthModule, OrdersModule, PaymentsModule, RolesModule, SmsModule, AdminModule, LinksModule, CoursesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
