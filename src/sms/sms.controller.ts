import { BadRequestException, Body, Controller, Post, Request } from '@nestjs/common';
import { SmsService } from './sms.service';
import { Payload } from 'src/auth/dto/payload.dto';
import { Public } from 'src/common/decorators/public-route.decorator';
import { RateLimit } from 'nestjs-rate-limiter';

@Controller('sms')
export class SmsController {

    constructor(
        private readonly smsService: SmsService
    ) {}

    @Public()
    @Post('send')
    async sendCode(@Body('phone') phone: string) {
        return this.smsService.sendVerificationCode(phone);
    }

    @Public()
    @RateLimit({ points: 5, duration: 60 }) // Limit to 5 requests per minute
    @Post('verify')
    async verifyCode(@Body() dto: { phone: string, code: string }) {
        return await this.smsService.verifyCode(dto.code, dto.phone);
    }

}
