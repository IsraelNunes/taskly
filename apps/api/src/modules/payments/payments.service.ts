import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { payments, serviceRequests } from '../../db/schema';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async create(serviceRequestId: string, clientId: string, dto: CreatePaymentDto) {
    const [request] = await this.db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, serviceRequestId))
      .limit(1);

    if (!request) throw new NotFoundException('Contratação não encontrada.');
    if (request.clientId !== clientId) throw new ForbiddenException('Sem permissão.');
    if (request.status !== 'CONCLUIDO') {
      throw new BadRequestException('Só é possível pagar contratações concluídas.');
    }

    const [existing] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.serviceRequestId, serviceRequestId))
      .limit(1);

    if (existing) throw new BadRequestException('Pagamento já registrado para esta contratação.');

    const [payment] = await this.db
      .insert(payments)
      .values({
        serviceRequestId,
        valor: dto.valor.toString(),
        metodo: dto.metodo,
        status: 'PAGO',
        pagoEm: new Date(),
      })
      .returning();

    return payment;
  }

  async findByServiceRequest(serviceRequestId: string, userId: string) {
    const [request] = await this.db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, serviceRequestId))
      .limit(1);

    if (!request) throw new NotFoundException('Contratação não encontrada.');

    const isParticipant =
      request.clientId === userId || request.professionalId === userId;

    if (!isParticipant) throw new ForbiddenException('Sem permissão.');

    const [payment] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.serviceRequestId, serviceRequestId))
      .limit(1);

    return payment ?? null;
  }
}
