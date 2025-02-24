import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';
import { SmsService } from './sms.service';
import { Public } from 'src/common/decorators/public-route.decorator';
import { SmsRateLimitExceptionFilter } from 'src/common/filters/sms-rate-limit.exception';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Controller('sms')
export class SmsController {

    constructor(
        private readonly smsService: SmsService
    ) {}

    @Public()
    @Throttle({ default: { limit: 1, ttl: 60000 } })
    @UseFilters(SmsRateLimitExceptionFilter)
    @Post('send')
    async sendCode(@Body('phone') phone: string) {
        return this.smsService.sendVerificationCode(phone);
    }

    @Public()
    @Throttle({ default: { limit: 7, ttl: 60000 } })
    @UseFilters(SmsRateLimitExceptionFilter)
    @Post('verify')
    async verifyCode(@Body() dto: { phone: string, code: string }) {
        return await this.smsService.verifyCode(dto.code, dto.phone);
    }

}
