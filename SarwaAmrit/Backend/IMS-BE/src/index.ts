import { createApp } from './app.js';
import { prisma } from './infrastructure/database/prisma.js';
import { env } from './shared/config/env.js';

const app = createApp();

async function shutdown(): Promise<void> {
  await prisma.$disconnect();
}

async function main(): Promise<void> {
  app.listen(env.PORT, () => {
    console.log(`IMS-BE listening on http://localhost:${env.PORT}`);
  });

  const stop = async (signal: string) => {
    console.log(`Received ${signal}, shutting down…`);
    await shutdown();
    process.exit(0);
  };

  process.on('SIGINT', () => void stop('SIGINT'));
  process.on('SIGTERM', () => void stop('SIGTERM'));
}

main().catch(async (error) => {
  console.error(error);
  await shutdown();
  process.exit(1);
});
