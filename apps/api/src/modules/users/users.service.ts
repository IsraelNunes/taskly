import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { profiles, users } from '../../db/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async create(params: {
    nome: string;
    username: string;
    passwordHash: string;
    perfilId: string;
  }): Promise<typeof users.$inferSelect> {
    const [created] = await this.db
      .insert(users)
      .values({
        nome: params.nome,
        username: params.username.toLowerCase(),
        passwordHash: params.passwordHash,
        perfilId: params.perfilId,
      })
      .returning();

    return created;
  }

  async findByUsername(username: string): Promise<(typeof users.$inferSelect) | null> {
    const normalized = username.toLowerCase();
    const [found] = await this.db.select().from(users).where(eq(users.username, normalized)).limit(1);
    return found ?? null;
  }

  async findAuthByUsername(username: string): Promise<{
    id: string;
    nome: string;
    username: string;
    passwordHash: string;
    perfil: string;
  } | null> {
    const normalized = username.toLowerCase();
    const [found] = await this.db
      .select({
        id: users.id,
        nome: users.nome,
        username: users.username,
        passwordHash: users.passwordHash,
        perfil: profiles.descricao,
      })
      .from(users)
      .innerJoin(profiles, eq(users.perfilId, profiles.id))
      .where(eq(users.username, normalized))
      .limit(1);

    return found ?? null;
  }

  async findById(id: string): Promise<(typeof users.$inferSelect) | null> {
    const [found] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return found ?? null;
  }

  async findPublicById(id: string): Promise<{
    id: string;
    nome: string;
    username: string;
    perfil: string;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    const [found] = await this.db
      .select({
        id: users.id,
        nome: users.nome,
        username: users.username,
        perfil: profiles.descricao,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(profiles, eq(users.perfilId, profiles.id))
      .where(eq(users.id, id))
      .limit(1);

    return found ?? null;
  }
}
