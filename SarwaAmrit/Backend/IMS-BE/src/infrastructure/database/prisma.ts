import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

import { env } from '../../shared/config/env.js';

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});
