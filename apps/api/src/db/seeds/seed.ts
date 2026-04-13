import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { profiles } from '../schema';

config({ path: '.env' });

const defaults = ['LEITOR', 'AUTOR', 'EDITOR', 'SUPERADMIN'] as const;

async function seed(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não definida.');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  try {
    for (const descricao of defaults) {
      await db
        .insert(profiles)
        .values({ descricao })
        .onConflictDoNothing({ target: profiles.descricao });
    }

    console.log('Seed de perfis executada com sucesso.');
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Erro ao executar seed:', error);
  process.exit(1);
});
