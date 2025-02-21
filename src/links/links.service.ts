import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PaymentLink } from './model/payment-link.model';
import { GenerateLinkDto } from './dto/generate-link.dto';

@Injectable()
export class PaymentLinkService {

    constructor(
        @InjectModel(PaymentLink) private readonly paymentLinkModel: typeof PaymentLink
    ) {}

    async generatePaymentLink(dto: GenerateLinkDto, adminId: number) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1); // Link valid for 1 days

        // Save the link details to the database
        const paymentLink = await this.paymentLinkModel.create({
            ...dto,
            expiresAt,
            adminId
        });

        // Return the link pointing to the frontend
        return { link: `https://popodpiske.com/login?id=${paymentLink.uuid}`};
    }

    async validatePaymentLink(id: string) {
        const link = await this.paymentLinkModel.findOne({ where: { uuid: id }, include: {all: true} });

        if (!link) {
            throw new BadRequestException("Ссылка не найдена");
        }

        if (new Date() > link.expiresAt) {
            throw new BadRequestException("Срок действия ссылки истек");
        }

        return link
    }

    async getAllLinks() {
        return await this.paymentLinkModel.findAll({include: {all: true},  order: [['id', 'ASC']],})
    }

    async getPaymentLinks(adminId: number) {
        return await this.paymentLinkModel.findAll({ where: { adminId }, include: [
            {
                all: true,
                nested: true,
            },
        ], order: [['id', 'ASC']], });
    }

    async markLinkAsUsed(id: string) {
        await this.paymentLinkModel.update({ isUsed: true }, { where: { uuid: id } });
    }
    
    async getPaymentLink(id: number) {
        return await this.paymentLinkModel.findByPk(id, {include: {all: true}});
    }

    async getPaymentLinksByUUID(uuid: string) {
        return await this.paymentLinkModel.findOne({ where: { uuid }, include: [{all: true, nested: true}] });
    }
}