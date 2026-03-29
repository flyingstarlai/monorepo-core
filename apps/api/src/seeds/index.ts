import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AppDataSource } from '../data-source';
import { seedUsers } from './user-seeds';

async function runSeeds() {
  const app = await NestFactory.create(AppModule);

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('🌱 Starting database seeding...');
    console.log('\n📋 Step 1: Seeding users...');
    await seedUsers(AppDataSource);

    console.log('\n✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    await app.close();
  }
}

if (require.main === module) {
  void runSeeds();
}

export { runSeeds };
