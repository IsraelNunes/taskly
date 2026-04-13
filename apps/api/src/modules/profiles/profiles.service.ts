import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { profiles } from '../../db/schema';

@Injectable()
export class ProfilesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

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
}
