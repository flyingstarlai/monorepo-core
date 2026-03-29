import { DataSource, DeepPartial } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { IdGenerator } from '../utils/id-generator';
import * as bcrypt from 'bcrypt';

const users = [
  {
    username: 'admin',
    password: 'nimda', // Will be hashed below
    fullName: 'System Administrator',
    role: 'admin',
    isActive: true,
  },
  {
    username: 'manager',
    password: 'manager', // Will be hashed below
    fullName: 'Manager User',
    role: 'manager',
    isActive: true,
  },
  {
    username: 'user',
    password: 'user', // Will be hashed below
    fullName: 'Regular User',
    role: 'user',
    isActive: true,
  },
];

export const seedUsers = async (dataSource: DataSource) => {
  try {
    const userRepository = dataSource.getRepository(User);

    // Conditionally hash passwords based on FEATURE_HASHED setting
    const shouldHashPassword = process.env.FEATURE_HASHED === 'true';
    console.log(
      `FEATURE_HASHED setting: ${shouldHashPassword ? 'true (using hashed passwords)' : 'false (using plain text passwords)'}`,
    );

    const processedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        id: IdGenerator.generateUserId(), // Use nanoid ID generation
        password: shouldHashPassword
          ? await bcrypt.hash(user.password, 10)
          : user.password,
      })),
    );

    // Check if users already exist
    const existingAdmin = await userRepository.findOne({
      where: { username: 'admin' },
    });
    const existingManager = await userRepository.findOne({
      where: { username: 'manager' },
    });
    const existingUser = await userRepository.findOne({
      where: { username: 'user' },
    });

    if (!existingAdmin) {
      const adminUser = userRepository.create(
        processedUsers[0] as DeepPartial<User>,
      );
      await userRepository.save(adminUser);
      console.log(
        `✅ Admin user created: admin/nimda (${shouldHashPassword ? 'hashed' : 'plain text'})`,
      );
    }

    if (!existingManager) {
      const managerUser = userRepository.create(
        processedUsers[1] as DeepPartial<User>,
      );
      await userRepository.save(managerUser);
      console.log(
        `✅ Manager user created: manager/manager (${shouldHashPassword ? 'hashed' : 'plain text'})`,
      );
    } else {
      // Update existing manager password if needed
      if (shouldHashPassword) {
        await userRepository.update(existingManager.id, {
          password: processedUsers[1].password,
        });
      }
    }

    if (!existingUser) {
      const regularUser = userRepository.create(
        processedUsers[2] as DeepPartial<User>,
      );
      await userRepository.save(regularUser);
      console.log(
        `✅ Regular user created: user/user (${shouldHashPassword ? 'hashed' : 'plain text'})`,
      );
    } else {
      // Update existing user password if needed
      if (shouldHashPassword) {
        await userRepository.update(existingUser.id, {
          password: processedUsers[2].password,
        });
      }
    }

    // Return user ID mapping for membership seeding
    const userIdMap: { [username: string]: string } = {
      admin: processedUsers[0].id,
      manager: processedUsers[1].id,
      user: processedUsers[2].id,
    };

    return userIdMap;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};
