import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { professionalAvailability, professionalProfiles } from '../../db/schema';
import { UpsertAvailabilityDto } from './dto/upsert-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async findByUserId(userId: string) {
    const [profile] = await this.db
      .select({ id: professionalProfiles.id })
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, userId))
      .limit(1);

    if (!profile) return [];

    return this.db
      .select()
      .from(professionalAvailability)
      .where(eq(professionalAvailability.professionalProfileId, profile.id))
      .orderBy(professionalAvailability.diaSemana);
  }

  async upsert(userId: string, dto: UpsertAvailabilityDto) {
    const [profile] = await this.db
      .select({ id: professionalProfiles.id })
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, userId))
      .limit(1);

    if (!profile) throw new NotFoundException('Perfil profissional não encontrado.');

    await this.db
      .delete(professionalAvailability)
      .where(eq(professionalAvailability.professionalProfileId, profile.id));

    if (dto.slots.length === 0) return [];

    return this.db
      .insert(professionalAvailability)
      .values(
        dto.slots.map((s) => ({
          professionalProfileId: profile.id,
          diaSemana: s.diaSemana,
          horaInicio: s.horaInicio,
          horaFim: s.horaFim,
          ativo: s.ativo,
        })),
      )
      .returning();
  }
}
