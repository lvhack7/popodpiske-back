import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';
import { SmsService } from './sms.service';
import { Public } from 'src/common/decorators/public-route.decorator';
import { SmsRateLimitExceptionFilter } from 'src/common/filters/sms-rate-limit.exception';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('СМС')
@UseGuards(ThrottlerGuard)
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Public()
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @UseFilters(SmsRateLimitExceptionFilter)
  @Post('send')
  @ApiOperation({
    summary: 'Отправка кода в СМС',
    description: 'Отправляет проверочный код на указанный номер телефона.',
  })
  @ApiResponse({ status: 201, description: 'Код успешно отправлен.' })
  @ApiResponse({ status: 429, description: 'Превышен лимит запросов.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: '+77771234567', description: 'Номер телефона для отправки кода' },
      },
    },
  })
  async sendCode(@Body('phone') phone: string) {
    return this.smsService.sendVerificationCode(phone);
  }

  @Public()
  @Throttle({ default: { limit: 7, ttl: 60000 } })
  @UseFilters(SmsRateLimitExceptionFilter)
  @Post('verify')
  @ApiOperation({
    summary: 'Проверка СМС кода',
    description: 'Проверяет введённый код для указанного номера телефона.',
  })
  @ApiResponse({ status: 200, description: 'Код успешно проверен.' })
  @ApiResponse({ status: 400, description: 'Неверный код или номер телефона.' })
  @ApiResponse({ status: 429, description: 'Превышен лимит запросов.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: '+77771234567', description: 'Номер телефона' },
        code: { type: 'string', example: '123456', description: 'Проверочный код' },
      },
    },
  })
  async verifyCode(@Body() dto: { phone: string; code: string }) {
    return await this.smsService.verifyCode(dto.code, dto.phone);
  }
}