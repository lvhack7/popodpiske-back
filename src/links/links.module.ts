import { Module } from '@nestjs/common';
import { LinksController } from './links.controller';
import { PaymentLinkService } from './links.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentLink } from './model/payment-link.model';

@Module({
  imports: [SequelizeModule.forFeature([PaymentLink])],
  controllers: [LinksController],
  providers: [PaymentLinkService],
  exports: [PaymentLinkService]
})
export class LinksModule {}
