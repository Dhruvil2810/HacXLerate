import { PrismaClient } from '@prisma/client';

const neonDirectUrl = 'postgresql://neondb_owner:npg_aQZ6Wf9elHpK@ep-falling-term-b5ods9fj.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: { url: neonDirectUrl }
  }
});

async function main() {
  console.log('Connecting to Neon to check and release advisory locks...');
  try {
    // Release advisory locks
    await prisma.$executeRawUnsafe(`SELECT pg_advisory_unlock_all();`);
    console.log('Successfully called pg_advisory_unlock_all()!');

    // Check for any other backend sessions holding locks
    const locks = await prisma.$queryRawUnsafe(`
      SELECT pid, locktype, mode, granted 
      FROM pg_locks 
      WHERE locktype = 'advisory';
    `);
    console.log('Active advisory locks:', locks);

    // If there are lingering sessions holding advisory locks, terminate them (except current pid)
    const currentPid = await prisma.$queryRawUnsafe(`SELECT pg_backend_pid();`);
    const myPid = currentPid[0].pg_backend_pid;
    console.log('Current connection PID:', myPid);

    const terminated = await prisma.$executeRawUnsafe(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE pid != pg_backend_pid() 
        AND datname = current_database() 
        AND state = 'idle';
    `);
    console.log('Terminated stale idle sessions.');

    // Now check if table _prisma_migrations has failed row
    const migrations = await prisma.$queryRawUnsafe(`
      SELECT id, migration_name, started_at, finished_at, rolled_back_at, applied_steps_count 
      FROM "_prisma_migrations";
    `).catch(() => []);
    console.log('Prisma migrations in Neon:\n', migrations);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
