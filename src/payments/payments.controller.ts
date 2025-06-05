import { Controller, Get, Param, Post } from '@nestjs/common';
import { SchedulePaymentService } from './schedule.service';
import { Public } from 'src/common/decorators/public-route.decorator';

@Controller('payments')
export class PaymentsController {

    constructor(
        private readonly scheduleService: SchedulePaymentService
    ) {}

    @Public()
    @Get('run-recurrent/:id')
    async runRecurrentPaymentForOrder(@Param('id') orderId: number) {
        return await this.scheduleService.runRecurrentPaymentForOrder(orderId);
    }
}