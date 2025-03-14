import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from './model/admin.model';
import { Course } from '../courses/model/course.model';
import { PaymentLink } from '../links/model/payment-link.model';
import { AdminRefreshToken } from './model/admin-refresh-token.model';
import { RolesModule } from 'src/roles/roles.module';
import { AdminRefreshTokenStrategy } from './strategies/admin-refresh-toke.strategy';
import { LinksModule } from 'src/links/links.module';

@Module({
  imports: [JwtModule.register({}), RolesModule, LinksModule, SequelizeModule.forFeature([Admin, AdminRefreshToken])],
  providers: [AdminService, AdminRefreshTokenStrategy],
  controllers: [AdminController]
})
export class AdminModule {}