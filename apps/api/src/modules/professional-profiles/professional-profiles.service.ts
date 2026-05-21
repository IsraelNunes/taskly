import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import {
  cities,
  portfolioImages,
  professionalCategories,
  professionalProfiles,
  profiles,
  serviceCategories,
  users,
} from '../../db/schema';
import { AddPortfolioImageDto } from './dto/add-portfolio-image.dto';
import { UpdateProfessionalProfileDto } from './dto/update-professional-profile.dto';

@Injectable()
export class ProfessionalProfilesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async findAll(categorySlug?: string, cidadeId?: string) {
    const baseQuery = this.db
      .select({
        id: professionalProfiles.id,
        userId: professionalProfiles.userId,
        nome: users.nome,
        avatarUrl: users.avatarUrl,
        bio: professionalProfiles.bio,
        avaliacaoMedia: professionalProfiles.avaliacaoMedia,
        totalAvaliacoes: professionalProfiles.totalAvaliacoes,
        isVerified: professionalProfiles.isVerified,
        cidade: cities.nome,
      })
      .from(professionalProfiles)
      .innerJoin(users, eq(professionalProfiles.userId, users.id))
      .leftJoin(cities, eq(professionalProfiles.cidadeId, cities.id));

    return baseQuery;
  }

  async findByUserId(userId: string) {
    const [base] = await this.db
      .select({
        id: professionalProfiles.id,
        userId: professionalProfiles.userId,
        bio: professionalProfiles.bio,
        avaliacaoMedia: professionalProfiles.avaliacaoMedia,
        totalAvaliacoes: professionalProfiles.totalAvaliacoes,
        isVerified: professionalProfiles.isVerified,
        nome: users.nome,
        username: users.username,
        email: users.email,
        telefone: users.telefone,
        avatarUrl: users.avatarUrl,
        perfil: profiles.descricao,
        cidade: cities.nome,
        cidadeId: professionalProfiles.cidadeId,
        createdAt: professionalProfiles.createdAt,
        updatedAt: professionalProfiles.updatedAt,
      })
      .from(professionalProfiles)
      .innerJoin(users, eq(professionalProfiles.userId, users.id))
      .innerJoin(profiles, eq(users.perfilId, profiles.id))
      .leftJoin(cities, eq(professionalProfiles.cidadeId, cities.id))
      .where(eq(professionalProfiles.userId, userId))
      .limit(1);

    if (!base) {
      return null;
    }

    const categories = await this.db
      .select({
        id: serviceCategories.id,
        nome: serviceCategories.nome,
        icone: serviceCategories.icone,
        slug: serviceCategories.slug,
      })
      .from(professionalCategories)
      .innerJoin(serviceCategories, eq(professionalCategories.categoryId, serviceCategories.id))
      .where(eq(professionalCategories.professionalProfileId, base.id));

    const portfolio = await this.db
      .select()
      .from(portfolioImages)
      .where(eq(portfolioImages.professionalProfileId, base.id))
      .orderBy(portfolioImages.ordem);

    return { ...base, categories, portfolio };
  }

  async ensureExists(userId: string): Promise<typeof professionalProfiles.$inferSelect> {
    const [existing] = await this.db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, userId))
      .limit(1);

    if (existing) {
      return existing;
    }

    const [created] = await this.db.insert(professionalProfiles).values({ userId }).returning();
    return created;
  }

  async update(userId: string, dto: UpdateProfessionalProfileDto) {
    const profile = await this.ensureExists(userId);

    const { categoryIds, ...profileData } = dto;

    if (Object.keys(profileData).length > 0) {
      await this.db
        .update(professionalProfiles)
        .set({ ...profileData, updatedAt: new Date() })
        .where(eq(professionalProfiles.userId, userId));
    }

    if (categoryIds !== undefined) {
      await this.db
        .delete(professionalCategories)
        .where(eq(professionalCategories.professionalProfileId, profile.id));

      if (categoryIds.length > 0) {
        await this.db.insert(professionalCategories).values(
          categoryIds.map((categoryId) => ({
            professionalProfileId: profile.id,
            categoryId,
          })),
        );
      }
    }

    return this.findByUserId(userId);
  }

  async addPortfolioImage(userId: string, dto: AddPortfolioImageDto) {
    const profile = await this.ensureExists(userId);

    const [image] = await this.db
      .insert(portfolioImages)
      .values({
        professionalProfileId: profile.id,
        imageUrl: dto.imageUrl,
        descricao: dto.descricao,
        ordem: dto.ordem ?? 0,
      })
      .returning();

    return image;
  }

  async removePortfolioImage(userId: string, imageId: string) {
    const profile = await this.ensureExists(userId);

    const [image] = await this.db
      .select()
      .from(portfolioImages)
      .where(
        and(eq(portfolioImages.id, imageId), eq(portfolioImages.professionalProfileId, profile.id)),
      )
      .limit(1);

    if (!image) {
      throw new NotFoundException('Imagem não encontrada.');
    }

    await this.db.delete(portfolioImages).where(eq(portfolioImages.id, imageId));
    return { message: 'Imagem removida com sucesso.' };
  }
}
