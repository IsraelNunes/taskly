import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { news, users } from '../../db/schema';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async findAllPublic(): Promise<
    Array<{
      id: string;
      titulo: string;
      imagem: string | null;
      resumo: string;
      status: string;
      dataCriacao: Date;
      dataPublicacao: Date | null;
      autorNome: string;
      autorId: string;
    }>
  > {
    return this.db
      .select({
        id: news.id,
        titulo: news.titulo,
        imagem: news.imagem,
        resumo: news.resumo,
        status: news.status,
        dataCriacao: news.dataCriacao,
        dataPublicacao: news.dataPublicacao,
        autorNome: users.nome,
        autorId: news.autorId,
      })
      .from(news)
      .innerJoin(users, eq(news.autorId, users.id))
      .where(eq(news.status, 'PUBLICADO'))
      .orderBy(desc(sql`COALESCE(${news.dataPublicacao}, ${news.dataCriacao})`));
  }

  async findById(id: string): Promise<{
    id: string;
    titulo: string;
    imagem: string | null;
    resumo: string;
    texto: string;
    status: string;
    dataCriacao: Date;
    dataPublicacao: Date | null;
    autorNome: string;
    autorId: string;
  }> {
    const [found] = await this.db
      .select({
        id: news.id,
        titulo: news.titulo,
        imagem: news.imagem,
        resumo: news.resumo,
        texto: news.texto,
        status: news.status,
        dataCriacao: news.dataCriacao,
        dataPublicacao: news.dataPublicacao,
        autorNome: users.nome,
        autorId: news.autorId,
      })
      .from(news)
      .innerJoin(users, eq(news.autorId, users.id))
      .where(eq(news.id, id))
      .limit(1);

    if (!found) {
      throw new NotFoundException('Notícia não encontrada.');
    }

    return found;
  }

  async create(dto: CreateNewsDto, currentUser: JwtPayload): Promise<typeof news.$inferSelect> {
    const status = dto.status ?? 'PUBLICADO';
    const dataPublicacao = status === 'PUBLICADO' ? dto.dataPublicacao ?? new Date() : null;

    const [created] = await this.db
      .insert(news)
      .values({
        titulo: dto.titulo,
        imagem: dto.imagem,
        resumo: dto.resumo,
        texto: dto.texto,
        status,
        autorId: currentUser.sub,
        dataPublicacao,
      })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdateNewsDto, currentUser: JwtPayload): Promise<typeof news.$inferSelect> {
    const existing = await this.getOwnedOrAdminRecord(id, currentUser);

    const nextStatus = dto.status ?? existing.status;
    const shouldPublish = nextStatus === 'PUBLICADO';
    const dataPublicacao = shouldPublish
      ? dto.dataPublicacao ?? existing.dataPublicacao ?? new Date()
      : null;

    const [updated] = await this.db
      .update(news)
      .set({
        titulo: dto.titulo ?? existing.titulo,
        imagem: dto.imagem ?? existing.imagem,
        resumo: dto.resumo ?? existing.resumo,
        texto: dto.texto ?? existing.texto,
        status: nextStatus,
        dataPublicacao,
        updatedAt: new Date(),
      })
      .where(eq(news.id, id))
      .returning();

    return updated;
  }

  async remove(id: string, currentUser: JwtPayload): Promise<{ message: string }> {
    await this.getOwnedOrAdminRecord(id, currentUser);

    await this.db.delete(news).where(eq(news.id, id));

    return { message: 'Notícia removida com sucesso.' };
  }

  private async getOwnedOrAdminRecord(id: string, currentUser: JwtPayload): Promise<typeof news.$inferSelect> {
    const [existing] = await this.db.select().from(news).where(eq(news.id, id)).limit(1);

    if (!existing) {
      throw new NotFoundException('Notícia não encontrada.');
    }

    const isOwner = existing.autorId === currentUser.sub;
    const isSuperAdmin = currentUser.perfil === 'SUPERADMIN';

    if (!isOwner && !isSuperAdmin) {
      throw new ForbiddenException('Você não tem permissão para alterar esta notícia.');
    }

    return existing;
  }
}
