import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { profiles, users } from '../../db/schema';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async findAll(): Promise<Array<typeof profiles.$inferSelect>> {
    return this.db.select().from(profiles);
  }

  async findById(id: string): Promise<typeof profiles.$inferSelect | null> {
    const [profile] = await this.db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return profile ?? null;
  }

  async findByDescricao(descricao: string): Promise<(typeof profiles.$inferSelect) | null> {
    const [profile] = await this.db
      .select()
      .from(profiles)
      .where(eq(profiles.descricao, descricao.toUpperCase()))
      .limit(1);

    return profile ?? null;
  }

  async findOrCreate(descricao: string): Promise<typeof profiles.$inferSelect> {
    const normalized = descricao.toUpperCase();
    const existing = await this.findByDescricao(normalized);

    if (existing) {
      return existing;
    }

    const [created] = await this.db.insert(profiles).values({ descricao: normalized }).returning();
    return created;
  }

  async create(dto: CreateProfileDto): Promise<typeof profiles.$inferSelect> {
    const normalized = dto.descricao.toUpperCase();
    const exists = await this.findByDescricao(normalized);

    if (exists) {
      throw new ConflictException('Perfil já existe.');
    }

    const [created] = await this.db.insert(profiles).values({ descricao: normalized }).returning();
    return created;
  }

  async update(id: string, dto: UpdateProfileDto): Promise<typeof profiles.$inferSelect> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Perfil não encontrado.');
    }

    const nextDescricao = dto.descricao?.toUpperCase() ?? existing.descricao;

    if (nextDescricao !== existing.descricao) {
      const duplicate = await this.findByDescricao(nextDescricao);
      if (duplicate && duplicate.id !== existing.id) {
        throw new ConflictException('Já existe perfil com essa descrição.');
      }
    }

    const [updated] = await this.db
      .update(profiles)
      .set({
        descricao: nextDescricao,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Perfil não encontrado.');
    }

    const [linkedUser] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.perfilId, id))
      .limit(1);

    if (linkedUser) {
      throw new ConflictException('Não é possível excluir perfil vinculado a usuários.');
    }

    await this.db.delete(profiles).where(eq(profiles.id, id));
    return { message: 'Perfil removido com sucesso.' };
  }
}
