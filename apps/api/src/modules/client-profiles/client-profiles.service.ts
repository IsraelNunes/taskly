import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { clientProfiles, cities, profiles, users } from '../../db/schema';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Injectable()
export class ClientProfilesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async findByUserId(userId: string) {
    const [result] = await this.db
      .select({
        id: clientProfiles.id,
        userId: clientProfiles.userId,
        notificacoesAtivas: clientProfiles.notificacoesAtivas,
        nome: users.nome,
        username: users.username,
        email: users.email,
        telefone: users.telefone,
        avatarUrl: users.avatarUrl,
        perfil: profiles.descricao,
        cidade: cities.nome,
        createdAt: clientProfiles.createdAt,
        updatedAt: clientProfiles.updatedAt,
      })
      .from(clientProfiles)
      .innerJoin(users, eq(clientProfiles.userId, users.id))
      .innerJoin(profiles, eq(users.perfilId, profiles.id))
      .leftJoin(cities, eq(users.cityId, cities.id))
      .where(eq(clientProfiles.userId, userId))
      .limit(1);

    return result ?? null;
  }

  async findPublicByUserId(userId: string) {
    const [result] = await this.db
      .select({
        id: clientProfiles.id,
        userId: clientProfiles.userId,
        nome: users.nome,
        avatarUrl: users.avatarUrl,
        cidade: cities.nome,
        createdAt: clientProfiles.createdAt,
      })
      .from(clientProfiles)
      .innerJoin(users, eq(clientProfiles.userId, users.id))
      .leftJoin(cities, eq(users.cityId, cities.id))
      .where(eq(clientProfiles.userId, userId))
      .limit(1);

    return result ?? null;
  }

  async ensureExists(userId: string): Promise<typeof clientProfiles.$inferSelect> {
    const [existing] = await this.db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, userId))
      .limit(1);

    if (existing) {
      return existing;
    }

    const [created] = await this.db.insert(clientProfiles).values({ userId }).returning();
    return created;
  }

  async update(userId: string, dto: UpdateClientProfileDto) {
    await this.ensureExists(userId);

    const [updated] = await this.db
      .update(clientProfiles)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(clientProfiles.userId, userId))
      .returning();

    return this.findByUserId(userId);
  }
}
