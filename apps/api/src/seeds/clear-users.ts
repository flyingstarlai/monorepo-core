import { AppDataSource } from '../data-source';
import { User } from '@repo/api';

async function clearUsers() {
  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);

    // Delete all existing users
    await userRepository.createQueryBuilder().delete().from(User).execute();

    // Close connection
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error during user clearing:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  void clearUsers();
}

export { clearUsers };
