import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GenerateLinkDto } from './dto/generate-link.dto';
import { PaymentLinkService } from './links.service';
import { Public } from 'src/common/decorators/public-route.decorator';
import { Role } from 'src/common/enum/roles.enum';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody, 
  ApiParam 
} from '@nestjs/swagger';

@ApiTags('Ссылки')
@Controller('links')
export class LinksController {
  constructor(private readonly paymentLinkService: PaymentLinkService) {}

  @Roles(Role.Admin, Role.Manager)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Генерация ссылки оплаты',
    description: 'Генерирует ссылку для оплаты на основе переданных данных (идентификатор курса и массив месяцев).',
  })
  @ApiBody({ type: GenerateLinkDto })
  @ApiResponse({ status: 201, description: 'Ссылка для оплаты успешно сгенерирована.' })
  @ApiResponse({ status: 400, description: 'Неверные входные данные.' })
  async generateLink(@Body() dto: GenerateLinkDto, @Request() req) {
    const admin = req.user;
    return await this.paymentLinkService.generatePaymentLink(dto, admin.id);
  }

  @Roles(Role.Admin, Role.Manager)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получение ссылок оплаты',
    description: 'Возвращает список ссылок оплаты, связанных с администратором.',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Ссылки оплаты успешно получены.' })
  async getLinks(@Request() req) {
    const admin = req.user;
    return await this.paymentLinkService.getPaymentLinks(admin.id);
  }

  @Roles(Role.Admin)
  @Get('all')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получение всех ссылок оплаты',
    description: 'Возвращает список всех ссылок оплаты.',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Все ссылки оплаты успешно получены.' })
  async getAllLinks() {
    return await this.paymentLinkService.getAllLinks();
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Проверка ссылки оплаты',
    description: 'Проверяет валидность ссылки оплаты по её уникальному идентификатору.',
  })
  @ApiParam({ name: 'id', description: 'Уникальный идентификатор ссылки оплаты', type: String })
  @ApiResponse({ status: 200, description: 'Ссылка оплаты валидна.' })
  @ApiResponse({ status: 404, description: 'Ссылка оплаты не найдена или недействительна.' })
  async validateLink(@Param('id') uuid: string) {
    return await this.paymentLinkService.validatePaymentLink(uuid);
  }
}