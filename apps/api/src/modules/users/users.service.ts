import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { clientProfiles, cities, professionalProfiles, profiles, users } from '../../db/schema';
import { ProfilesService } from '../profiles/profiles.service';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UpdateOwnUserDto } from './dto/update-own-user.dto';

type PublicUser = {
  id: string;
  nome: string;
  username: string;
  email: string | null;
  telefone: string | null;
  avatarUrl: string | null;
  perfil: string;
  cidade: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase,
    private readonly profilesService: ProfilesService,
  ) {}

  async create(params: {
    nome: string;
    username: string;
    passwordHash: string;
    perfilId: string;
    cpf?: string;
  }): Promise<typeof users.$inferSelect> {
    const normalized = params.username.toLowerCase();
    const existing = await this.findByUsername(normalized);

    if (existing) {
      throw new ConflictException('Username já está em uso.');
    }

    const [created] = await this.db
      .insert(users)
      .values({
        nome: params.nome,
        username: normalized,
        passwordHash: params.passwordHash,
        perfilId: params.perfilId,
        cpf: params.cpf ?? null,
      })
      .returning();

    return created;
  }

  async createWithProfile(params: {
    nome: string;
    username: string;
    passwordHash: string;
    perfilId: string;
    role: string;
    cpf?: string;
  }): Promise<typeof users.$inferSelect> {
    const user = await this.create(params);

    if (params.role === 'CLIENTE') {
      await this.db.insert(clientProfiles).values({ userId: user.id }).onConflictDoNothing();
    } else if (params.role === 'PROFISSIONAL') {
      await this.db.insert(professionalProfiles).values({ userId: user.id }).onConflictDoNothing();
    }

    return user;
  }

  async findAllAdminView(): Promise<PublicUser[]> {
    const rows = await this.db
      .select({
        id: users.id,
        nome: users.nome,
        username: users.username,
        email: users.email,
        telefone: users.telefone,
        avatarUrl: users.avatarUrl,
        perfil: profiles.descricao,
        cidade: cities.nome,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(profiles, eq(users.perfilId, profiles.id))
      .leftJoin(cities, eq(users.cityId, cities.id));

    return rows;
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

  async findPublicById(id: string): Promise<PublicUser | null> {
    const [found] = await this.db
      .select({
        id: users.id,
        nome: users.nome,
        username: users.username,
        email: users.email,
        telefone: users.telefone,
        avatarUrl: users.avatarUrl,
        perfil: profiles.descricao,
        cidade: cities.nome,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(profiles, eq(users.perfilId, profiles.id))
      .leftJoin(cities, eq(users.cityId, cities.id))
      .where(eq(users.id, id))
      .limit(1);

    return found ?? null;
  }

  async updateOwn(userId: string, dto: UpdateOwnUserDto): Promise<PublicUser> {
    const existing = await this.findById(userId);

    if (!existing) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    let nextUsername = existing.username;

    if (dto.username) {
      nextUsername = dto.username.toLowerCase();
      const duplicate = await this.findByUsername(nextUsername);
      if (duplicate && duplicate.id !== existing.id) {
        throw new ConflictException('Username já está em uso.');
      }
    }

    const nextPasswordHash = dto.password ? await bcrypt.hash(dto.password, 10) : existing.passwordHash;

    await this.db
      .update(users)
      .set({
        nome: dto.nome ?? existing.nome,
        username: nextUsername,
        email: dto.email ?? existing.email,
        telefone: dto.telefone ?? existing.telefone,
        avatarUrl: dto.avatarUrl ?? existing.avatarUrl,
        passwordHash: nextPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    const updated = await this.findPublicById(userId);

    if (!updated) {
      throw new NotFoundException('Usuário não encontrado após atualização.');
    }

    return updated;
  }

  async adminCreate(dto: AdminCreateUserDto): Promise<PublicUser> {
    const perfil = await this.profilesService.findOrCreate(dto.perfil ?? 'CLIENTE');

    const user = await this.createWithProfile({
      nome: dto.nome,
      username: dto.username,
      passwordHash: await bcrypt.hash(dto.password, 10),
      perfilId: perfil.id,
      role: perfil.descricao,
    });

    const publicUser = await this.findPublicById(user.id);

    if (!publicUser) {
      throw new NotFoundException('Usuário não encontrado após criação.');
    }

    return publicUser;
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto): Promise<PublicUser> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    let nextUsername = existing.username;

    if (dto.username) {
      nextUsername = dto.username.toLowerCase();
      const duplicate = await this.findByUsername(nextUsername);
      if (duplicate && duplicate.id !== existing.id) {
        throw new ConflictException('Username já está em uso.');
      }
    }

    let nextPerfilId = existing.perfilId;

    if (dto.perfil) {
      const perfil = await this.profilesService.findOrCreate(dto.perfil);
      nextPerfilId = perfil.id;
    }

    const nextPasswordHash = dto.password ? await bcrypt.hash(dto.password, 10) : existing.passwordHash;

    await this.db
      .update(users)
      .set({
        nome: dto.nome ?? existing.nome,
        username: nextUsername,
        passwordHash: nextPasswordHash,
        perfilId: nextPerfilId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    const updated = await this.findPublicById(id);

    if (!updated) {
      throw new NotFoundException('Usuário não encontrado após atualização.');
    }

    return updated;
  }

  async adminRemove(id: string): Promise<{ message: string }> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    await this.db.delete(users).where(eq(users.id, id));
    return { message: 'Usuário removido com sucesso.' };
  }
}
