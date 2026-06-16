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
import { payments, serviceRequests, users } from '../../db/schema';
import { AsaasService } from '../asaas/asaas.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase,
    private readonly asaas: AsaasService,
  ) {}

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

    if (dto.metodo === 'DINHEIRO') {
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

    if (!dto.cpf) {
      throw new BadRequestException('CPF é obrigatório para pagamentos via PIX ou Cartão.');
    }

    const customerId = await this.getOrCreateAsaasCustomer(clientId, dto.cpf);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const dueDateStr = dueDate.toISOString().split('T')[0] as string;
    const description = `Contratação #${serviceRequestId.slice(0, 8)}`;

    if (dto.metodo === 'PIX') {
      const asaasPayment = await this.asaas.createPixPayment({
        customerId,
        value: dto.valor,
        description,
        dueDate: dueDateStr,
      });

      const qrCode = await this.asaas.getPixQrCode(asaasPayment.id);

      const [payment] = await this.db
        .insert(payments)
        .values({
          serviceRequestId,
          valor: dto.valor.toString(),
          metodo: 'PIX',
          status: 'AGUARDANDO',
          asaasPaymentId: asaasPayment.id,
          pixQrCode: qrCode.encodedImage,
          pixCopiaCola: qrCode.payload,
        })
        .returning();

      return payment;
    }

    if (dto.metodo === 'CARTAO') {
      if (!dto.cartao) {
        throw new BadRequestException('Dados do cartão são obrigatórios para pagamento via Cartão.');
      }

      const [clientUser] = await this.db
        .select({ nome: users.nome, telefone: users.telefone })
        .from(users)
        .where(eq(users.id, clientId))
        .limit(1);

      const asaasPayment = await this.asaas.createCreditCardPayment({
        customerId,
        value: dto.valor,
        description,
        dueDate: dueDateStr,
        creditCard: {
          holderName: dto.cartao.holderName,
          number: dto.cartao.number,
          expiryMonth: dto.cartao.expiryMonth,
          expiryYear: dto.cartao.expiryYear,
          ccv: dto.cartao.cvv,
        },
        creditCardHolderInfo: {
          name: clientUser?.nome ?? dto.cartao.holderName,
          cpfCnpj: dto.cpf,
          email: dto.cartao.email,
          mobilePhone: dto.cartao.telefone ?? clientUser?.telefone ?? '00000000000',
          postalCode: dto.cartao.cep,
          addressNumber: dto.cartao.numeroEndereco,
        },
        remoteIp: '127.0.0.1',
      });

      const isApproved = ['CONFIRMED', 'RECEIVED'].includes(asaasPayment.status);

      const [payment] = await this.db
        .insert(payments)
        .values({
          serviceRequestId,
          valor: dto.valor.toString(),
          metodo: 'CARTAO',
          status: isApproved ? 'PAGO' : 'AGUARDANDO',
          asaasPaymentId: asaasPayment.id,
          pagoEm: isApproved ? new Date() : null,
        })
        .returning();

      return payment;
    }

    throw new BadRequestException('Método de pagamento inválido.');
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

  async confirmByAsaasId(asaasPaymentId: string): Promise<void> {
    await this.db
      .update(payments)
      .set({ status: 'PAGO', pagoEm: new Date() })
      .where(eq(payments.asaasPaymentId, asaasPaymentId));
  }

  private async getOrCreateAsaasCustomer(clientId: string, cpf: string): Promise<string> {
    const [user] = await this.db
      .select({
        id: users.id,
        nome: users.nome,
        email: users.email,
        telefone: users.telefone,
        asaasCustomerId: users.asaasCustomerId,
      })
      .from(users)
      .where(eq(users.id, clientId))
      .limit(1);

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    if (user.asaasCustomerId) {
      return user.asaasCustomerId;
    }

    const customer = await this.asaas.createCustomer({
      name: user.nome,
      cpfCnpj: cpf,
      email: user.email ?? undefined,
      mobilePhone: user.telefone ?? undefined,
    });

    await this.db
      .update(users)
      .set({ asaasCustomerId: customer.id, cpf, updatedAt: new Date() })
      .where(eq(users.id, clientId));

    return customer.id;
  }
}
