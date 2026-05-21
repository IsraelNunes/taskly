import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { cities, ufs } from '../../db/schema';
import { CreateUfDto } from './dto/create-uf.dto';
import { UpdateUfDto } from './dto/update-uf.dto';

@Injectable()
export class UfsService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async findAll(): Promise<Array<typeof ufs.$inferSelect>> {
    return this.db.select().from(ufs);
  }

  async findById(id: string): Promise<typeof ufs.$inferSelect | null> {
    const [found] = await this.db.select().from(ufs).where(eq(ufs.id, id)).limit(1);
    return found ?? null;
  }

  async create(dto: CreateUfDto): Promise<typeof ufs.$inferSelect> {
    const sigla = dto.sigla.trim().toUpperCase();
    const [duplicate] = await this.db.select().from(ufs).where(eq(ufs.sigla, sigla)).limit(1);

    if (duplicate) {
      throw new ConflictException('UF já cadastrada.');
    }

    const [created] = await this.db.insert(ufs).values({ sigla, nome: dto.nome.trim() }).returning();
    return created;
  }

  async update(id: string, dto: UpdateUfDto): Promise<typeof ufs.$inferSelect> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('UF não encontrada.');
    }

    const nextSigla = dto.sigla?.trim().toUpperCase() ?? existing.sigla;

    if (nextSigla !== existing.sigla) {
      const [duplicate] = await this.db.select().from(ufs).where(eq(ufs.sigla, nextSigla)).limit(1);
      if (duplicate && duplicate.id !== existing.id) {
        throw new ConflictException('Sigla de UF já cadastrada.');
      }
    }

    const [updated] = await this.db
      .update(ufs)
      .set({
        sigla: nextSigla,
        nome: dto.nome?.trim() ?? existing.nome,
        updatedAt: new Date(),
      })
      .where(eq(ufs.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('UF não encontrada.');
    }

    const [linkedCity] = await this.db
      .select({ id: cities.id })
      .from(cities)
      .where(eq(cities.ufId, id))
      .limit(1);

    if (linkedCity) {
      throw new ConflictException('Não é possível excluir UF vinculada a cidades.');
    }

    await this.db.delete(ufs).where(eq(ufs.id, id));
    return { message: 'UF removida com sucesso.' };
  }
}
