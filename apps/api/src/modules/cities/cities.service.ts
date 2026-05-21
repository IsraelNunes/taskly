import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { cities, ufs } from '../../db/schema';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async findAll(ufId?: string): Promise<
    Array<{
      id: string;
      nome: string;
      ufId: string;
      ufSigla: string;
      ufNome: string;
      createdAt: Date;
      updatedAt: Date;
    }>
  > {
    const base = this.db
      .select({
        id: cities.id,
        nome: cities.nome,
        ufId: cities.ufId,
        ufSigla: ufs.sigla,
        ufNome: ufs.nome,
        createdAt: cities.createdAt,
        updatedAt: cities.updatedAt,
      })
      .from(cities)
      .innerJoin(ufs, eq(cities.ufId, ufs.id));

    if (ufId) {
      return base.where(eq(cities.ufId, ufId));
    }

    return base;
  }

  async findById(id: string): Promise<typeof cities.$inferSelect | null> {
    const [found] = await this.db.select().from(cities).where(eq(cities.id, id)).limit(1);
    return found ?? null;
  }

  async create(dto: CreateCityDto): Promise<typeof cities.$inferSelect> {
    const [uf] = await this.db.select().from(ufs).where(eq(ufs.id, dto.ufId)).limit(1);

    if (!uf) {
      throw new NotFoundException('UF não encontrada para a cidade informada.');
    }

    const [created] = await this.db
      .insert(cities)
      .values({
        nome: dto.nome.trim(),
        ufId: dto.ufId,
      })
      .returning();

    return created;
  }

  async update(id: string, dto: UpdateCityDto): Promise<typeof cities.$inferSelect> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Cidade não encontrada.');
    }

    const nextUfId = dto.ufId ?? existing.ufId;

    if (nextUfId !== existing.ufId) {
      const [uf] = await this.db.select().from(ufs).where(eq(ufs.id, nextUfId)).limit(1);
      if (!uf) {
        throw new NotFoundException('UF não encontrada para a cidade informada.');
      }
    }

    const [updated] = await this.db
      .update(cities)
      .set({
        nome: dto.nome?.trim() ?? existing.nome,
        ufId: nextUfId,
        updatedAt: new Date(),
      })
      .where(eq(cities.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Cidade não encontrada.');
    }

    await this.db.delete(cities).where(eq(cities.id, id));
    return { message: 'Cidade removida com sucesso.' };
  }
}
