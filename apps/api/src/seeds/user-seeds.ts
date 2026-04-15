import { DataSource, DeepPartial } from 'typeorm';
import { User } from '@repo/api';
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

    const processedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        id: IdGenerator.generateUserId(),
        password: await bcrypt.hash(user.password, 10),
      })),
    );

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
      console.log('✅ Admin user created: admin/nimda (hashed)');
    }

    if (!existingManager) {
      const managerUser = userRepository.create(
        processedUsers[1] as DeepPartial<User>,
      );
      await userRepository.save(managerUser);
      console.log('✅ Manager user created: manager/manager (hashed)');
    }

    if (!existingUser) {
      const regularUser = userRepository.create(
        processedUsers[2] as DeepPartial<User>,
      );
      await userRepository.save(regularUser);
      console.log('✅ Regular user created: user/user (hashed)');
    }

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
