import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AppDataSource } from '../data-source';
import { User } from '../users/entities/user.entity';
import { Group } from '../groups/entities/group.entity';
import { UserGroupMembership } from '../groups/entities/user-group-membership.entity';

async function clearUsersAndGroups() {
  const app = await NestFactory.create(AppModule);

  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('🧹 Clearing existing data...');

    // Delete in order to respect foreign key constraints
    const membershipRepository =
      AppDataSource.getRepository(UserGroupMembership);
    const groupRepository = AppDataSource.getRepository(Group);
    const userRepository = AppDataSource.getRepository(User);

    // Delete memberships first (due to foreign key constraints)
    const membershipCount = await membershipRepository.count();
    if (membershipCount > 0) {
      await membershipRepository
        .createQueryBuilder()
        .delete()
        .from(UserGroupMembership)
        .execute();
      console.log(`✅ Deleted ${membershipCount} user-group memberships`);
    }

    // Delete groups
    const groupCount = await groupRepository.count();
    if (groupCount > 0) {
      await groupRepository.createQueryBuilder().delete().from(Group).execute();
      console.log(`✅ Deleted ${groupCount} groups`);
    }

    // Delete users
    const userCount = await userRepository.count();
    if (userCount > 0) {
      await userRepository.createQueryBuilder().delete().from(User).execute();
      console.log(`✅ Deleted ${userCount} users`);
    }

    console.log('✅ All user and group data cleared successfully!');

    // Close connection
    await AppDataSource.destroy();
    await app.close();
  } catch (error) {
    console.error('❌ Error during clearing:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  void clearUsersAndGroups();
}

export { clearUsersAndGroups };
