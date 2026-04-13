import { Global, Module, OnModuleDestroy, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DRIZZLE_DB, PG_POOL } from './database.constants';
import * as schema from './schema';

@Injectable()
class DatabaseCleanupService implements OnModuleDestroy {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new Pool({
          connectionString: configService.getOrThrow<string>('DATABASE_URL'),
        }),
    },
    {
      provide: DRIZZLE_DB,
      inject: [PG_POOL],
      useFactory: (pool: Pool) => drizzle(pool, { schema }),
    },
    DatabaseCleanupService,
  ],
  exports: [PG_POOL, DRIZZLE_DB],
})
export class DatabaseModule {}
