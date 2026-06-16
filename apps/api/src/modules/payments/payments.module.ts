import { Module } from '@nestjs/common';
import { AsaasModule } from '../asaas/asaas.module';
import { PaymentsController } from './payments.controller';
import { WebhookController } from './webhook.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [AsaasModule],
  controllers: [PaymentsController, WebhookController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
