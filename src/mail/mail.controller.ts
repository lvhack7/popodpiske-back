import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public-route.decorator';
import { MailService } from './mail.service';

@ApiTags('Почта')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Public()
  @Post('send')
  @ApiOperation({
    summary: 'Отправка кода на почту',
    description: 'Отправляет проверочный код на указанный почтоый адрес.',
  })
  @ApiResponse({ status: 201, description: 'Код успешно отправлен.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: 'test@mail.com', description: 'Почта для отправки кода' },
      },
    },
  })
  async sendCode(@Body() dto: { email: string, emailType: 'registration' | 'passwordReset' }) {
    return this.mailService.sendVerificationCode(dto.email, dto.emailType);
  }

  @Public()
  @Post('verify')
  @ApiOperation({
    summary: 'Проверка кода',
    description: 'Проверяет введённый код.',
  })
  @ApiResponse({ status: 200, description: 'Код успешно проверен.' })
  @ApiResponse({ status: 400, description: 'Неверный код или номер телефона.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', example: 'mail@mail.com', description: 'Почта' },
        code: { type: 'string', example: '123456', description: 'Проверочный код' },
      },
    },
  })
  async verifyCode(@Body() dto: { email: string; code: string }) {
    return await this.mailService.verifyCode(dto.code, dto.email);
  }
}