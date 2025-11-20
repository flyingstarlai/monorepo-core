import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { FactoryUserDto } from './dto/factory-user.dto';
import { FactoryDepartmentDto } from './dto/factory-department.dto';
import { formatDateUTC8 } from '../utils/date-formatter';
import { UsersFilterDto } from './dto/users-filter.dto';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { RoleService } from './role.service';
import { UserLoginLogDto } from './dto/user-login-log.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    creatorRole?: string,
  ): Promise<User> {
    try {
      const {
        username,
        password,
        fullName,
        deptNo,
        deptName,
        role = 'user',
        isActive = true,
      } = createUserDto;

      // Validate role creation permissions
      this.validateRoleCreation(role, creatorRole);

      // Check if password should be hashed based on FEATURE_HASHED setting
      const shouldHashPassword = process.env.FEATURE_HASHED === 'true';
      const finalPassword = shouldHashPassword
        ? await bcrypt.hash(password, 10)
        : password;

      if (shouldHashPassword) {
        console.log(
          'Hash test - immediate compare:',
          bcrypt.compareSync(password, finalPassword),
        );
      }

      const user = this.usersRepository.create({
        id: this.generateId(),
        username,
        password: finalPassword,
        fullName,
        deptNo,
        deptName,
        role,
        isActive,
      });

      const result = await this.usersRepository.save(user);

      // Immediately retrieve to check if hash is corrupted
      const retrieved = await this.usersRepository.findOne({
        where: { username },
      });
      console.log(
        'Retrieved matches saved:',
        result.password === retrieved?.password,
      );

      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  private validateRoleCreation(
    roleToCreate: string,
    creatorRole?: string,
  ): void {
    if (!creatorRole) {
      throw new BadRequestException(
        'Creator role is required for user creation',
      );
    }

    if (
      !RoleService.canCreateUserWithRole(
        creatorRole as UserRole,
        roleToCreate as UserRole,
      )
    ) {
      const availableRoles = RoleService.getAvailableRolesForCreation(
        creatorRole as UserRole,
      );
      throw new BadRequestException(
        `Cannot create user with role "${roleToCreate}". Available roles: ${availableRoles.join(', ') || 'None'}`,
      );
    }
  }

  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async getLatestMobileLoginForUser(userId: string): Promise<{
    lastMobileLoginAt: string | null;
    lastMobileDeviceId: string | null;
    lastMobileAppName: string | null;
    lastMobileAppVersion: string | null;
    lastMobileAppModule: string | null;
  }> {
    const latest = await this.usersRepository.query(
      `SELECT TOP 1
        login_at,
        app_id,
        app_name,
        app_version,
        app_module
       FROM dbo.TC_ACCOUNT_LOGIN
       WHERE account_id = @0
       ORDER BY login_at DESC
       `,
      [userId],
    );

    if (latest.length === 0) {
      return {
        lastMobileLoginAt: null,
        lastMobileDeviceId: null,
        lastMobileAppName: null,
        lastMobileAppVersion: null,
        lastMobileAppModule: null,
      };
    }

    const row = latest[0];
    return {
      lastMobileLoginAt: row.login_at
        ? formatDateUTC8(new Date(row.login_at as string | number | Date))
        : null,
      lastMobileDeviceId: row.app_id || null,
      lastMobileAppName: row.app_name || null,
      lastMobileAppVersion: row.app_version || null,
      lastMobileAppModule: row.app_module || null,
    };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    const usersWithMobile = await Promise.all(
      users.map(async (user) => {
        const mobile = await this.getLatestMobileLoginForUser(user.id);
        return {
          ...user,
          ...mobile,
        };
      }),
    );

    return usersWithMobile.map(
      (user) =>
        ({
          ...user,
          lastLoginAt: user.lastLoginAt
            ? formatDateUTC8(user.lastLoginAt)
            : null,
          createdAt: user.createdAt ? formatDateUTC8(user.createdAt) : null,
          updatedAt: user.updatedAt ? formatDateUTC8(user.updatedAt) : null,
        }) as UserResponseDto,
    );
  }

  async findWithFilters(filters: UsersFilterDto): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      search,
      role,
      isActive,
      deptNo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(user.username LIKE :search OR user.fullName LIKE :search OR user.deptName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply role filter
    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    // Apply status filter
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    // Apply department filter
    if (deptNo) {
      queryBuilder.andWhere('user.deptNo = :deptNo', { deptNo });
    }

    // Apply sorting
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const users = await queryBuilder.getMany();
    const usersWithMobile = await Promise.all(
      users.map(async (user) => {
        const mobile = await this.getLatestMobileLoginForUser(user.id);
        return {
          ...user,
          ...mobile,
        };
      }),
    );

    const formattedUsers = usersWithMobile.map(
      (user) =>
        ({
          ...user,
          lastLoginAt: user.lastLoginAt
            ? formatDateUTC8(user.lastLoginAt)
            : null,
          createdAt: user.createdAt ? formatDateUTC8(user.createdAt) : null,
          updatedAt: user.updatedAt ? formatDateUTC8(user.updatedAt) : null,
        }) as UserResponseDto,
    );

    return {
      users: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const mobile = await this.getLatestMobileLoginForUser(user.id);
    return {
      ...user,
      ...mobile,
      lastLoginAt: user.lastLoginAt ? formatDateUTC8(user.lastLoginAt) : null,
      createdAt: user.createdAt ? formatDateUTC8(user.createdAt) : null,
      updatedAt: user.updatedAt ? formatDateUTC8(user.updatedAt) : null,
    } as UserResponseDto;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    creatorRole?: string,
  ): Promise<UserResponseDto> {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Validate role change permissions if role is being updated
    if (updateUserDto.role && updateUserDto.role !== existingUser.role) {
      if (
        !RoleService.canEditUserRole(
          creatorRole as UserRole,
          updateUserDto.role as UserRole,
        )
      ) {
        throw new BadRequestException(
          'Only administrators can change user roles',
        );
      }
    }

    await this.usersRepository.update(id, updateUserDto);
    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const mobile = await this.getLatestMobileLoginForUser(updatedUser.id);
    return {
      ...updatedUser,
      ...mobile,
      lastLoginAt: updatedUser.lastLoginAt
        ? formatDateUTC8(updatedUser.lastLoginAt)
        : null,
      createdAt: updatedUser.createdAt
        ? formatDateUTC8(updatedUser.createdAt)
        : null,
      updatedAt: updatedUser.updatedAt
        ? formatDateUTC8(updatedUser.updatedAt)
        : null,
    } as UserResponseDto;
  }

  async remove(id: string): Promise<void> {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.delete(id);
  }

  async findByUsername(username: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      return null;
    }

    const mobile = await this.getLatestMobileLoginForUser(user.id);
    return {
      ...user,
      ...mobile,
      lastLoginAt: user.lastLoginAt ? formatDateUTC8(user.lastLoginAt) : null,
      createdAt: user.createdAt ? formatDateUTC8(user.createdAt) : null,
      updatedAt: user.updatedAt ? formatDateUTC8(user.updatedAt) : null,
    } as UserResponseDto;
  }

  async validateUserCredentials(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    console.log({
      username,
      passwordLength: password.length,
    });
    const user = await this.usersRepository.findOne({
      where: { username, isActive: true },
    });

    if (!user) {
      return null;
    }

    // Check if password should be compared as hash or plain text
    const shouldHashPassword = process.env.FEATURE_HASHED === 'true';
    let isValidPassword = false;

    if (shouldHashPassword) {
      // Compare with hashed password
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Compare with plain text password
      isValidPassword = password === user.password;
    }

    if (isValidPassword) {
      // Exclude password from returned user object
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as Omit<User, 'password'>;
    }

    return null;
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }

    const mobile = await this.getLatestMobileLoginForUser(user.id);
    return {
      ...user,
      ...mobile,
      lastLoginAt: user.lastLoginAt ? formatDateUTC8(user.lastLoginAt) : null,
      createdAt: user.createdAt ? formatDateUTC8(user.createdAt) : null,
      updatedAt: user.updatedAt ? formatDateUTC8(user.updatedAt) : null,
    } as UserResponseDto;
  }

  async findRawById(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const shouldHashPassword = process.env.FEATURE_HASHED === 'true';
    const finalPassword = shouldHashPassword
      ? await bcrypt.hash(newPassword, 10)
      : newPassword;

    await this.usersRepository.update(id, { password: finalPassword });
  }

  async toggleUserStatus(id: string): Promise<UserResponseDto> {
    const user = await this.findRawById(id);
    const newStatus = !user.isActive;
    await this.usersRepository.update(id, { isActive: newStatus });
    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const mobile = await this.getLatestMobileLoginForUser(updatedUser.id);
    return {
      ...updatedUser,
      ...mobile,
      lastLoginAt: updatedUser.lastLoginAt
        ? formatDateUTC8(updatedUser.lastLoginAt)
        : null,
      createdAt: updatedUser.createdAt
        ? formatDateUTC8(updatedUser.createdAt)
        : null,
      updatedAt: updatedUser.updatedAt
        ? formatDateUTC8(updatedUser.updatedAt)
        : null,
    } as UserResponseDto;
  }

  async searchUsers(query: string): Promise<UserResponseDto[]> {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.username LIKE :query', { query: `%${query}%` })
      .orWhere('user.fullName LIKE :query', { query: `%${query}%` })
      .orWhere('user.deptName LIKE :query', { query: `%${query}%` })
      .orderBy('user.fullName', 'ASC')
      .limit(20)
      .getMany();

    const usersWithMobile = await Promise.all(
      users.map(async (user) => {
        const mobile = await this.getLatestMobileLoginForUser(user.id);
        return {
          ...user,
          ...mobile,
        };
      }),
    );

    return usersWithMobile.map(
      (user) =>
        ({
          ...user,
          lastLoginAt: user.lastLoginAt
            ? formatDateUTC8(user.lastLoginAt)
            : null,
          createdAt: user.createdAt ? formatDateUTC8(user.createdAt) : null,
          updatedAt: user.updatedAt ? formatDateUTC8(user.updatedAt) : null,
        }) as UserResponseDto,
    );
  }

  async login(
    user: User,
  ): Promise<{ access_token: string; user: UserResponseDto }> {
    // Update lastLoginAt
    await this.usersRepository.update(user.id, { lastLoginAt: new Date() });

    const mobile = await this.getLatestMobileLoginForUser(user.id);
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        deptNo: user.deptNo,
        deptName: user.deptName,
        role: user.role,
        isActive: user.isActive,
        ...mobile,
        lastLoginAt: user.lastLoginAt ? formatDateUTC8(user.lastLoginAt) : null,
        createdAt: user.createdAt ? formatDateUTC8(user.createdAt) : null,
        updatedAt: user.updatedAt ? formatDateUTC8(user.updatedAt) : null,
      } as UserResponseDto,
    };
  }

  async updateProfile(
    id: string,
    updateProfileDto: { fullName: string },
  ): Promise<UserResponseDto> {
    const existingUser = await this.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.update(id, updateProfileDto);
    const updatedUser = await this.usersRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const mobile = await this.getLatestMobileLoginForUser(updatedUser.id);
    return {
      ...updatedUser,
      ...mobile,
      lastLoginAt: updatedUser.lastLoginAt
        ? formatDateUTC8(updatedUser.lastLoginAt)
        : null,
      createdAt: updatedUser.createdAt
        ? formatDateUTC8(updatedUser.createdAt)
        : null,
      updatedAt: updatedUser.updatedAt
        ? formatDateUTC8(updatedUser.updatedAt)
        : null,
    } as UserResponseDto;
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.findRawById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verify current password
    const shouldHashPassword = process.env.FEATURE_HASHED === 'true';
    let isValidCurrentPassword = false;

    if (shouldHashPassword) {
      isValidCurrentPassword = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );
    } else {
      isValidCurrentPassword =
        changePasswordDto.currentPassword === user.password;
    }

    if (!isValidCurrentPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    const shouldHashNewPassword = process.env.FEATURE_HASHED === 'true';
    const finalPassword = shouldHashNewPassword
      ? await bcrypt.hash(changePasswordDto.newPassword, 10)
      : changePasswordDto.newPassword;

    await this.usersRepository.update(id, { password: finalPassword });

    return { message: 'Password changed successfully' };
  }

  async getFactoryUsers(): Promise<FactoryUserDto[]> {
    try {
      const result = await this.usersRepository.query(
        'EXEC ACM_FACTORY_USER_ACCOUNT',
      );

      // Map procedure results to FactoryUserDto format
      const factoryUsers = result.map((item: any) => {
        const mapped = {
          username: item.username || '',
          full_name: item.full_name || '',
          dept_no: item.dept_no || '',
          dept_name: item.dept_name || '',
        };
        return mapped;
      });

      // Transform to camelCase for frontend
      const camelCaseFactoryUsers = factoryUsers.map((item) => ({
        username: item.username,
        fullName: item.full_name,
        deptNo: item.dept_no,
        deptName: item.dept_name,
      }));

      return camelCaseFactoryUsers;
    } catch (error) {
      console.error(
        'Error executing ACM_FACTORY_USER_ACCOUNT procedure:',
        error,
      );
      throw new BadRequestException(
        'Failed to retrieve factory users. Please try again later.',
      );
    }
  }

  async getFactoryDepartments(): Promise<FactoryDepartmentDto[]> {
    try {
      const result = await this.usersRepository.query('EXEC ACM_FACTORY_DEPT');

      // Map procedure results to FactoryDepartmentDto format
      const factoryDepartments = result.map((item: any) => {
        const mapped = {
          dept_no: item.dept_no || '',
          dept_name: item.dept_name || '',
        };
        return mapped;
      });

      // Transform to camelCase for frontend
      const camelCaseFactoryDepartments = factoryDepartments.map((item) => ({
        deptNo: item.dept_no,
        deptName: item.dept_name,
      }));

      return camelCaseFactoryDepartments;
    } catch (error) {
      console.error('Error executing ACM_FACTORY_DEPT procedure:', error);
      throw new BadRequestException(
        'Failed to retrieve factory departments. Please try again later.',
      );
    }
  }

  async findLoginHistoryByUserId(
    userId: string,
    limit = 100,
  ): Promise<{
    items: UserLoginLogDto[];
  }> {
    const limitInt = Math.max(1, Math.floor(limit));

    const itemsResult = await this.usersRepository.query(
      `
      SELECT TOP ${limitInt}
        _key AS logId,
        account_id AS userId,
        login_at AS loginAt,
        success,
        failure_reason AS failureReason,
        app_id AS deviceId,
        app_name AS appName,
        app_version AS appVersion,
        app_module AS appModule
       FROM dbo.TC_ACCOUNT_LOGIN
       WHERE account_id = @0
       ORDER BY login_at DESC
       `,
      [userId],
    );

    const items = itemsResult.map((row: any) => ({
      logId: row.logId,
      loginAt: row.loginAt
        ? formatDateUTC8(new Date(row.loginAt as string | number | Date))
        : null,
      success: Boolean(row.success),
      failureReason: row.failureReason || null,
      deviceId: row.deviceId || null,
      appName: row.appName || null,
      appVersion: row.appVersion || null,
      appModule: row.appModule || null,
    }));

    return {
      items,
    };
  }
}
