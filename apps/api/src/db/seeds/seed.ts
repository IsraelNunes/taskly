import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { clientProfiles, professionalProfiles, profiles, serviceCategories, users } from '../schema';

config({ path: '.env' });

const defaultRoles = ['CLIENTE', 'PROFISSIONAL', 'ADMIN'] as const;

const defaultCategories = [
  { nome: 'Elétrica', icone: 'flash-outline', slug: 'eletrica' },
  { nome: 'Hidráulica', icone: 'water-outline', slug: 'hidraulica' },
  { nome: 'Marcenaria', icone: 'hammer-outline', slug: 'marcenaria' },
  { nome: 'Pintura', icone: 'brush-outline', slug: 'pintura' },
  { nome: 'Limpeza', icone: 'sparkles-outline', slug: 'limpeza' },
  { nome: 'Jardinagem', icone: 'leaf-outline', slug: 'jardinagem' },
  { nome: 'Reformas', icone: 'construct-outline', slug: 'reformas' },
  { nome: 'Montagem de Móveis', icone: 'cube-outline', slug: 'montagem-moveis' },
  { nome: 'Ar-condicionado', icone: 'thermometer-outline', slug: 'ar-condicionado' },
  { nome: 'Dedetização', icone: 'bug-outline', slug: 'dedetizacao' },
] as const;

async function seed(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não definida.');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    // Seed profiles
    for (const descricao of defaultRoles) {
      await db
        .insert(profiles)
        .values({ descricao })
        .onConflictDoNothing({ target: profiles.descricao });
    }

    // Seed service categories
    for (const category of defaultCategories) {
      await db
        .insert(serviceCategories)
        .values(category)
        .onConflictDoNothing({ target: serviceCategories.slug });
    }

    const profileRows = await db.select().from(profiles);
    const profileByDescription = new Map(profileRows.map((item) => [item.descricao, item]));

    const passwordHash = await bcrypt.hash('123456', 10);

    const defaultUsers = [
      { nome: 'Cliente Demo', username: 'cliente', perfil: 'CLIENTE' as const },
      { nome: 'Profissional Demo', username: 'profissional', perfil: 'PROFISSIONAL' as const },
      { nome: 'Admin Demo', username: 'admin', perfil: 'ADMIN' as const },
    ];

    for (const entry of defaultUsers) {
      const profile = profileByDescription.get(entry.perfil);

      if (!profile) {
        continue;
      }

      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, entry.username))
        .limit(1);

      if (existingUser) {
        continue;
      }

      const [createdUser] = await db
        .insert(users)
        .values({
          nome: entry.nome,
          username: entry.username,
          passwordHash,
          perfilId: profile.id,
        })
        .returning();

      // Create profile record based on role
      if (entry.perfil === 'CLIENTE') {
        await db.insert(clientProfiles).values({ userId: createdUser.id }).onConflictDoNothing();
      } else if (entry.perfil === 'PROFISSIONAL') {
        await db
          .insert(professionalProfiles)
          .values({ userId: createdUser.id })
          .onConflictDoNothing();
      }
    }

    console.log('Seed executada com sucesso: perfis, categorias e usuários padrão criados.');
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Erro ao executar seed:', error);
  process.exit(1);
});
