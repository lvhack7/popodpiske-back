import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { SmsService } from 'src/sms/sms.service';

@Catch(ThrottlerException)
export class SmsRateLimitExceptionFilter implements ExceptionFilter {
  constructor(private readonly smsService: SmsService) {}

  async catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Extract phone from request body (assuming it's present)
    const phone = request.body?.phone;

    if (phone) {
      // Remove all SMS codes associated with this phone from the database.
      // Implement this method in your SmsService as needed.
      await this.smsService.removePhone(phone)
    }
                                                
    response.status(HttpStatus.TOO_MANY_REQUESTS).json({
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message: 'Слишком много запросов. Попробуйте позже.',
    });
  }
}