import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AppDataSource } from '../data-source';
import { seedUsers } from './user-seeds';
import { seedGroups } from './group-seeds';
import { seedMemberships } from './membership-seeds';

async function runSeeds() {
  const app = await NestFactory.create(AppModule);

  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('🌱 Starting database seeding...');

    // Run all seeders in order
    console.log('\n📋 Step 1: Seeding users...');
    const userIdMap = await seedUsers(AppDataSource);

    console.log('\n👥 Step 2: Seeding groups...');
    const groupIdMap = await seedGroups(AppDataSource);

    console.log('\n🔗 Step 3: Seeding user-group memberships...');
    await seedMemberships(AppDataSource, userIdMap, groupIdMap);

    console.log('\n✅ Database seeding completed successfully!');
    console.log(
      `📊 Summary: ${Object.keys(userIdMap || {}).length} users, ${Object.keys(groupIdMap || {}).length} groups, 4 memberships created.`,
    );

    // Close connection if needed
    // await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    await app.close();
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  void runSeeds();
}

export { runSeeds };
