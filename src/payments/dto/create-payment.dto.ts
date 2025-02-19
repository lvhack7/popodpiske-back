export class CreatePaymentDto {
    readonly amount: number
    readonly paymentDate: Date
    readonly orderId: number
    readonly transactionId?: string
    readonly status: string
    readonly currency: string
}