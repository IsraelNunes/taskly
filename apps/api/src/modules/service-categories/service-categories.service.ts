import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '../../db/database.constants';
import { DrizzleDatabase } from '../../db/database.types';
import { serviceCategories } from '../../db/schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class ServiceCategoriesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  async findAll(): Promise<Array<typeof serviceCategories.$inferSelect>> {
    return this.db.select().from(serviceCategories).orderBy(serviceCategories.nome);
  }

  async findById(id: string): Promise<(typeof serviceCategories.$inferSelect) | null> {
    const [found] = await this.db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.id, id))
      .limit(1);
    return found ?? null;
  }

  async create(dto: CreateCategoryDto): Promise<typeof serviceCategories.$inferSelect> {
    const existing = await this.db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.slug, dto.slug))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Já existe uma categoria com esse slug.');
    }

    const [created] = await this.db.insert(serviceCategories).values(dto).returning();
    return created;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<typeof serviceCategories.$inferSelect> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const duplicate = await this.db
        .select()
        .from(serviceCategories)
        .where(eq(serviceCategories.slug, dto.slug))
        .limit(1);

      if (duplicate.length > 0) {
        throw new ConflictException('Já existe uma categoria com esse slug.');
      }
    }

    const [updated] = await this.db
      .update(serviceCategories)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(serviceCategories.id, id))
      .returning();

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    await this.db.delete(serviceCategories).where(eq(serviceCategories.id, id));
    return { message: 'Categoria removida com sucesso.' };
  }
}
