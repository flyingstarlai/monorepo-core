import { AppDataSource } from '../data-source';
import { seedUsers } from './user-seeds';

async function runSeeds() {
  try {
    console.log('🌱 Starting database seeding...');

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    }

    // Run all seeders
    await seedUsers(AppDataSource);

    console.log('🎉 All seeds executed successfully');

    // Close connection if needed
    // await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run seeds if this file is executed directly
if (require.main === module) {
  void runSeeds();
}

export { runSeeds };
