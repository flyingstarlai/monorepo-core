import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

const users = [
  {
    id: 'admin-001',
    username: 'admin',
    password: 'nimda', // Will be hashed below
    fullName: 'System Administrator',
    deptNo: 'SYS001',
    deptName: 'System Administration',
    role: 'admin',
    isActive: true,
  },
  {
    id: 'manager-001',
    username: 'manager',
    password: 'manager', // Will be hashed below
    fullName: 'Manager User',
    deptNo: 'MGR001',
    deptName: 'Management',
    role: 'manager',
    isActive: true,
  },
  {
    id: 'user-001',
    username: 'user',
    password: 'user', // Will be hashed below
    fullName: 'Regular User',
    deptNo: 'USR001',
    deptName: 'General Operations',
    role: 'user',
    isActive: true,
  },
];

export const seedUsers = async (dataSource: DataSource) => {
  try {
    console.log('Seeding users...');

    const userRepository = dataSource.getRepository(User);

    // Conditionally hash passwords based on FEATURE_HASHED setting
    const shouldHashPassword = process.env.FEATURE_HASHED === 'true';
    console.log(
      `FEATURE_HASHED setting: ${shouldHashPassword ? 'true (using hashed passwords)' : 'false (using plain text passwords)'}`,
    );

    const processedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
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
      const adminUser = userRepository.create(processedUsers[0] as any);
      await userRepository.save(adminUser);
      console.log(
        `✅ Admin user created: admin/nimda (${shouldHashPassword ? 'hashed' : 'plain text'})`,
      );
    }

    if (!existingManager) {
      const managerUser = userRepository.create(processedUsers[1] as any);
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
        console.log('🔄 Manager password updated to hashed');
      }
    }

    if (!existingUser) {
      const regularUser = userRepository.create(processedUsers[2] as any);
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
        console.log('🔄 Regular user password updated to hashed');
      }
    }

    if (!existingUser) {
      const regularUser = userRepository.create(processedUsers[2] as any);
      await userRepository.save(regularUser);
      console.log(
        `✅ Regular user created: user/resu (${shouldHashPassword ? 'hashed' : 'plain text'})`,
      );
    }

    if (!existingManager) {
      const managerUser = userRepository.create(processedUsers[1] as any);
      await userRepository.save(managerUser);
      console.log(
        `✅ Manager user created: manager/manager (${shouldHashPassword ? 'hashed' : 'plain text'})`,
      );
    } else {
      console.log('ℹ️ Manager user already exists');
    }

    if (!existingUser) {
      const regularUser = userRepository.create(processedUsers[2] as any);
      await userRepository.save(regularUser);
      console.log(
        `✅ User created: user/user (${shouldHashPassword ? 'hashed' : 'plain text'})`,
      );
    } else {
      console.log('ℹ️ User already exists');
    }

    console.log('🎉 User seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};
