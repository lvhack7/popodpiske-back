import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GenerateLinkDto } from './dto/generate-link.dto';
import { PaymentLinkService } from './links.service';
import { Public } from 'src/common/decorators/public-route.decorator';
import { Role } from 'src/common/enum/roles.enum';


@Controller('links')
export class LinksController {

    constructor(
        private readonly paymentLinkService: PaymentLinkService
    ) {}

    @Roles(Role.Admin, Role.Manager)
    @Post()
    async generateLink(@Body() dto: GenerateLinkDto, @Request() req) {
        const admin = req.user;
        return await this.paymentLinkService.generatePaymentLink(dto, admin.id)
    }
    
    @Roles(Role.Admin, Role.Manager)
    @Get()
    async getLinks(@Request() req) {
        const admin = req.user;
        return await this.paymentLinkService.getPaymentLinks(admin.id);
    }

    @Roles(Role.Admin)
    @Get("all")
    async getAllLinks() {
        return await this.paymentLinkService.getAllLinks()
    }

    @Public()
    @Get(":id")
    async validateLink(@Param('id') uuid: string) {
        return await this.paymentLinkService.validatePaymentLink(uuid)
    }

}
