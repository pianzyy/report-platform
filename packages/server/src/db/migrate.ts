import { initDatabase, closeDatabase } from '../config/database';

async function main() {
  console.log('Running database migrations...');
  await initDatabase();
  console.log('Migrations completed successfully.');
  closeDatabase();
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
