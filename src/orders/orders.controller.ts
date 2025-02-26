import { Body, Controller, Delete, Get, Param, Post, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Payload } from 'src/auth/dto/payload.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public-route.decorator';
import { PaymentLinkService } from 'src/links/links.service';
import { Role } from 'src/common/enum/roles.enum';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody, 
  ApiParam 
} from '@nestjs/swagger';
import { Order } from './model/order.model';

@ApiTags('Заказы')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly orderService: OrdersService,
    private readonly paymentLinkService: PaymentLinkService
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создание заказа', description: 'Создает новый заказ для текущего пользователя.' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 200, description: 'Заказ успешно создан.' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации или неверные входные данные.' })
  async createOrder(@Body() dto: CreateOrderDto, @Request() req) {
    const user = req.user as Payload;
    console.log("ORDER: ", user.id);
    return await this.orderService.createOrder(dto, user.id);
  }

  @Post("success")
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Успешный заказ', description: 'Отмечает заказ как успешный по переданному linkId.' })
  @ApiBody({ schema: { example: { linkId: 'abc123-uuid' } } })
  @ApiResponse({ status: 200, description: 'Заказ успешно отмечен как успешный.' })
  async successOrder(@Body() dto: { linkId: string }) {
    return await this.orderService.successOrder(dto.linkId);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение заказов', description: 'Возвращает список заказов для текущего пользователя.' })
  @ApiResponse({ status: 200, description: 'Список заказов успешно получен.', type: [Order] })
  async getOrders(@Request() req) {
    const user = req.user as Payload;
    return await this.orderService.getOrders(user.id);
  }

  @Delete()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отмена заказа', description: 'Отменяет заказ по его идентификатору, переданному в теле запроса.' })
  @ApiBody({ schema: { example: { orderId: 1 } } })
  @ApiResponse({ status: 200, description: 'Заказ успешно отменен.' })
  async cancelOrder(@Body('orderId') orderId: number, @Request() req) {
    const user = req.user as Payload;
    return await this.orderService.cancelOrder(orderId, user.id);
  }

  @Public()
  @Post("callback/:id")
  @ApiOperation({ summary: 'Callback заказа', description: 'Обрабатывает callback для заказа по его идентификатору.' })
  @ApiParam({ name: 'id', description: 'Идентификатор заказа', type: String })
  @ApiBody({ schema: { example: { someData: 'значение' } } })
  @ApiResponse({ status: 200, description: 'Callback успешно обработан.' })
  async getCallback(@Param('id') orderId: string, @Body() dto: any) {
    return await this.orderService.getCallback(orderId, dto);
  }

  @Roles(Role.Manager, Role.Admin)
  @Get("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение заказов для администратора', description: 'Возвращает список заказов для администратора по его идентификатору.' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Список заказов для администратора успешно получен.', type: [Order] })
  async getAdminOrders(@Request() req) {
    const admin = req.user;
    return await this.orderService.getAdminOrders(admin.id);
  }

  @Roles(Role.Admin)
  @Get("all")
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение всех заказов', description: 'Возвращает список всех заказов.' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Список всех заказов успешно получен.', type: [Order] })
  async getAllOrders() {
    return await this.orderService.getAllOrders();
  }

  @Public()
  @Get('links/:id')
  @ApiOperation({ summary: 'Проверка ссылки оплаты', description: 'Проверяет валидность ссылки оплаты по её идентификатору.' })
  @ApiParam({ name: 'id', description: 'Идентификатор ссылки оплаты', type: String })
  @ApiResponse({ status: 200, description: 'Ссылка оплаты валидна.' })
  async validatePaymentLink(@Param('id') id: string) {
    return await this.paymentLinkService.validatePaymentLink(id);
  }

  @Post('links/:id/mark-used')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отметить ссылку оплаты как использованную', description: 'Помечает ссылку оплаты как использованную по её идентификатору.' })
  @ApiParam({ name: 'id', description: 'Идентификатор ссылки оплаты', type: String })
  @ApiResponse({ status: 200, description: 'Ссылка оплаты успешно отмечена как использованная.' })
  async markPaymentLinkAsUsed(@Param('id') id: string) {
    return await this.paymentLinkService.markLinkAsUsed(id);
  }
}