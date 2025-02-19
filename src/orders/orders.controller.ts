import { Body, Controller, Delete, Get, Param, Post, Put, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Payload } from 'src/auth/dto/payload.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public-route.decorator';
import { PaymentLinkService } from 'src/links/links.service';
import { Role } from 'src/common/enum/roles.enum';
import { number } from 'joi';

@Controller('orders')
export class OrdersController {

    constructor(
        private readonly orderService: OrdersService,
        private readonly paymentLinkService: PaymentLinkService
    ) {}

    @Post()
    async createOrder(@Body() dto: CreateOrderDto, @Request() req) {
        const user = req.user as Payload;
        console.log("ORDER: ", user.id);
        return await this.orderService.createOrder(dto, user.id);
    }

    @Post("success")
    async successOrder(@Body() dto: { linkId: string }) {
        return await this.orderService.successOrder(dto.linkId);
    }

    @Get()
    async getOrders(@Request() req) {
        const user = req.user as Payload;
        return await this.orderService.getOrders(user.id);
    }

    @Delete()
    async cancelOrder(@Body('orderId') orderId: number, @Request() req) {
        const user = req.user as Payload;
        return await this.orderService.cancelOrder(orderId, user.id);
    }

    @Public()
    @Post("callback/:id")
    async getCallback(@Param('id') orderId: string, @Body() dto: any) {
        return await this.orderService.getCallback(orderId, dto)
    }

    @Roles(Role.Manager, Role.Admin)
    @Get("admin")
    async getAdminOrders(@Request() req) {
        const admin = req.user
        return await this.orderService.getAdminOrders(admin.id)
    }

    @Roles(Role.Admin)
    @Get("all")
    async getAllOrders() {
        return await this.orderService.getAllOrders();
    }

    @Public()
    @Get('links/:id')
    async validatePaymentLink(@Param('id') id: string) {
        return await this.paymentLinkService.validatePaymentLink(id);
    }

    // Mark a payment link as used
    @Post('links/:id/mark-used')
    async markPaymentLinkAsUsed(@Param('id') id: string) {
        return await this.paymentLinkService.markLinkAsUsed(id);
    }
}