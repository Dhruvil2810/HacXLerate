import { execSync } from 'child_process';

const neonDirectUrl = 'postgresql://neondb_owner:npg_aQZ6Wf9elHpK@ep-falling-term-b5ods9fj.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

console.log('Resolving rolled-back migration 0_init on Neon...');
try {
  const result = execSync('npx prisma migrate resolve --rolled-back "0_init"', {
    cwd: 'd:\\Creater Market Place\\backend',
    env: { ...process.env, DATABASE_URL: neonDirectUrl },
    encoding: 'utf-8',
  });
  console.log('Resolve output:\n', result);
} catch (err) {
  console.error('Error running migrate resolve:', err.stdout || err.message);
}
