import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

interface AsaasWebhookPayload {
  event: string;
  payment?: { id: string };
}

@Controller('webhooks/asaas')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly service: PaymentsService) {}

  @Post()
  @HttpCode(200)
  async handle(@Body() body: AsaasWebhookPayload): Promise<void> {
    const { event, payment } = body;
    this.logger.log(`Asaas webhook recebido: ${event}`);

    if (payment?.id && ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'].includes(event)) {
      await this.service.confirmByAsaasId(payment.id);
      this.logger.log(`Pagamento confirmado via Asaas: ${payment.id}`);
    }
  }
}
