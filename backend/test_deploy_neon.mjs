import { execSync } from 'child_process';

const neonDirectUrl = 'postgresql://neondb_owner:npg_aQZ6Wf9elHpK@ep-falling-term-b5ods9fj.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

console.log('Running npx prisma migrate deploy on Neon direct URL...');
try {
  const result = execSync('npx prisma migrate deploy', {
    cwd: 'd:\\Creater Market Place\\backend',
    env: { ...process.env, DATABASE_URL: neonDirectUrl },
    encoding: 'utf-8',
  });
  console.log('Deploy output:\n', result);
} catch (err) {
  console.error('Error running migrate deploy:', err.stdout || err.message);
}
