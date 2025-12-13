import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AppDataSource } from './src/data-source';

async function runMigrations() {
  const app = await NestFactory.create(AppModule);

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('Running migrations...');
    await AppDataSource.runMigrations();
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exitCode = 1;
  } finally {
    await AppDataSource.destroy();
    await app.close();
  }
}

runMigrations().catch((error) => {
  console.error('Migration script failed:', error);
  process.exit(1);
});
