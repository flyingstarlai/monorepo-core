import { AppDataSource } from '../data-source';
import { seedUsers } from './user-seeds';

async function runSeeds() {
  try {

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Run all seeders
    await seedUsers(AppDataSource);


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
