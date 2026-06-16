import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, or } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { payments, serviceCategories, serviceRequests, users } from '../../db/schema';
import { CancelServiceRequestDto } from './dto/cancel-service-request.dto';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';

@Injectable()
export class ServiceRequestsService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async create(clientId: string, dto: CreateServiceRequestDto) {
    const [request] = await this.db
      .insert(serviceRequests)
      .values({
        clientId,
        professionalId: dto.professionalId,
        categoryId: dto.categoryId ?? null,
        descricao: dto.descricao,
        endereco: dto.endereco ?? null,
        dataAgendada: dto.dataAgendada ? new Date(dto.dataAgendada) : null,
        valorEstimado: dto.valorEstimado?.toString() ?? null,
        status: 'PENDENTE',
      })
      .returning();

    return this.findOne(request.id, clientId);
  }

  async findAll(userId: string, perfil: string) {
    const condition =
      perfil === 'CLIENTE'
        ? eq(serviceRequests.clientId, userId)
        : eq(serviceRequests.professionalId, userId);

    const rows = await this.db
      .select({
        id: serviceRequests.id,
        status: serviceRequests.status,
        descricao: serviceRequests.descricao,
        endereco: serviceRequests.endereco,
        dataAgendada: serviceRequests.dataAgendada,
        valorEstimado: serviceRequests.valorEstimado,
        motivoCancelamento: serviceRequests.motivoCancelamento,
        createdAt: serviceRequests.createdAt,
        updatedAt: serviceRequests.updatedAt,
        clienteNome: users.nome,
        categoriaNome: serviceCategories.nome,
        clientId: serviceRequests.clientId,
        professionalId: serviceRequests.professionalId,
      })
      .from(serviceRequests)
      .leftJoin(users, eq(serviceRequests.clientId, users.id))
      .leftJoin(serviceCategories, eq(serviceRequests.categoryId, serviceCategories.id))
      .where(condition)
      .orderBy(desc(serviceRequests.createdAt));

    return rows;
  }

  async findOne(id: string, userId: string) {
    const [row] = await this.db
      .select({
        id: serviceRequests.id,
        status: serviceRequests.status,
        descricao: serviceRequests.descricao,
        endereco: serviceRequests.endereco,
        dataAgendada: serviceRequests.dataAgendada,
        valorEstimado: serviceRequests.valorEstimado,
        motivoCancelamento: serviceRequests.motivoCancelamento,
        createdAt: serviceRequests.createdAt,
        updatedAt: serviceRequests.updatedAt,
        clientId: serviceRequests.clientId,
        professionalId: serviceRequests.professionalId,
        categoryId: serviceRequests.categoryId,
        categoriaNome: serviceCategories.nome,
      })
      .from(serviceRequests)
      .leftJoin(serviceCategories, eq(serviceRequests.categoryId, serviceCategories.id))
      .where(
        and(
          eq(serviceRequests.id, id),
          or(eq(serviceRequests.clientId, userId), eq(serviceRequests.professionalId, userId)),
        ),
      )
      .limit(1);

    if (!row) throw new NotFoundException('Contratação não encontrada.');

    const [paymentRow] = await this.db
      .select()
      .from(payments)
      .where(eq(payments.serviceRequestId, id))
      .limit(1);

    return { ...row, payment: paymentRow ?? null };
  }

  async confirmar(id: string, userId: string) {
    const request = await this.getAndValidate(id, userId, 'PROFISSIONAL', ['PENDENTE']);
    return this.setStatus(request.id, 'CONFIRMADO');
  }

  async iniciar(id: string, userId: string) {
    const request = await this.getAndValidate(id, userId, 'PROFISSIONAL', ['CONFIRMADO']);
    return this.setStatus(request.id, 'EM_ANDAMENTO');
  }

  async concluir(id: string, userId: string) {
    const request = await this.getAndValidate(id, userId, 'PROFISSIONAL', ['EM_ANDAMENTO']);
    return this.setStatus(request.id, 'CONCLUIDO');
  }

  async cancelar(id: string, userId: string, dto: CancelServiceRequestDto) {
    const [row] = await this.db
      .select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.id, id),
          or(eq(serviceRequests.clientId, userId), eq(serviceRequests.professionalId, userId)),
        ),
      )
      .limit(1);

    if (!row) throw new NotFoundException('Contratação não encontrada.');

    if (!['PENDENTE', 'CONFIRMADO'].includes(row.status)) {
      throw new BadRequestException('Não é possível cancelar uma contratação neste status.');
    }

    const [updated] = await this.db
      .update(serviceRequests)
      .set({
        status: 'CANCELADO',
        motivoCancelamento: dto.motivoCancelamento ?? null,
        updatedAt: new Date(),
      })
      .where(eq(serviceRequests.id, id))
      .returning();

    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const [row] = await this.db
      .select()
      .from(serviceRequests)
      .where(
        and(
          eq(serviceRequests.id, id),
          or(eq(serviceRequests.clientId, userId), eq(serviceRequests.professionalId, userId)),
        ),
      )
      .limit(1);

    if (!row) throw new NotFoundException('Contratação não encontrada.');

    if (!['CONCLUIDO', 'CANCELADO'].includes(row.status)) {
      throw new BadRequestException(
        'Só é possível excluir contratações concluídas ou canceladas.',
      );
    }

    await this.db.delete(serviceRequests).where(eq(serviceRequests.id, id));
  }

  private async getAndValidate(
    id: string,
    userId: string,
    expectedRole: 'PROFISSIONAL' | 'CLIENTE',
    allowedStatuses: string[],
  ) {
    const [row] = await this.db
      .select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id))
      .limit(1);

    if (!row) throw new NotFoundException('Contratação não encontrada.');

    const isOwner =
      expectedRole === 'PROFISSIONAL'
        ? row.professionalId === userId
        : row.clientId === userId;

    if (!isOwner) throw new ForbiddenException('Sem permissão para esta ação.');

    if (!allowedStatuses.includes(row.status)) {
      throw new BadRequestException(
        `Ação não permitida para o status atual: ${row.status}.`,
      );
    }

    return row;
  }

  private async setStatus(id: string, status: string) {
    const [updated] = await this.db
      .update(serviceRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(serviceRequests.id, id))
      .returning();

    return updated;
  }
}
