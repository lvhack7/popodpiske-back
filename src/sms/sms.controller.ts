import { BadRequestException, Body, Controller, Post, Request, UseFilters } from '@nestjs/common';
import { SmsService } from './sms.service';
import { Payload } from 'src/auth/dto/payload.dto';
import { Public } from 'src/common/decorators/public-route.decorator';
import { RateLimit } from 'nestjs-rate-limiter';
import { SmsRateLimitExceptionFilter } from 'src/common/filters/sms-rate-limit.exception';

@Controller('sms')
export class SmsController {

    constructor(
        private readonly smsService: SmsService
    ) {}

    @Public()
    @RateLimit({ points: 1, duration: 60 })
    @UseFilters(SmsRateLimitExceptionFilter)
    @Post('send')
    async sendCode(@Body('phone') phone: string) {
        return this.smsService.sendVerificationCode(phone);
    }

    @Public()
    @RateLimit({ points: 10, duration: 60 }) // Limit to 5 requests per minute
    @UseFilters(SmsRateLimitExceptionFilter)
    @Post('verify')
    async verifyCode(@Body() dto: { phone: string, code: string }) {
        return await this.smsService.verifyCode(dto.code, dto.phone);
    }

}
