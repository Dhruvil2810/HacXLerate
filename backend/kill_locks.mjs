import { PrismaClient } from '@prisma/client';

const neonDirectUrl = 'postgresql://neondb_owner:npg_aQZ6Wf9elHpK@ep-falling-term-b5ods9fj.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const prisma = new PrismaClient({ datasources: { db: { url: neonDirectUrl } } });

async function main() {
  await prisma.$executeRawUnsafe(`SELECT pg_terminate_backend(pid) FROM pg_locks WHERE locktype = 'advisory';`);
  const locks = await prisma.$queryRawUnsafe(`SELECT pid, locktype, mode FROM pg_locks WHERE locktype = 'advisory';`);
  console.log('Remaining advisory locks:', locks);
  await prisma.$disconnect();
}

main();
