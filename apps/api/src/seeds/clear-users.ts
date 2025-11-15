import { AppDataSource } from '../data-source';
import { User } from '../users/entities/user.entity';

async function clearUsers() {
  try {
    console.log('🗑️  Clearing existing users...');

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    }

    const userRepository = AppDataSource.getRepository(User);

    // Delete all existing users
    const result = await userRepository
      .createQueryBuilder()
      .delete()
      .from(User)
      .execute();
    console.log(`✅ Deleted ${result.affected} users from database`);

    // Close connection
    await AppDataSource.destroy();
    console.log('🎉 User clearing completed successfully');
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
