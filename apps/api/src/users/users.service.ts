import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './entities/user.entity';
import { LoginHistory } from './entities/login-history.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { FactoryUserDto } from './dto/factory-user.dto';
import { FactoryDepartmentDto } from './dto/factory-department.dto';
import { IdGenerator } from '../utils/id-generator';
import { formatDateUTC8 } from '../utils/date-formatter';
import { UsersFilterDto } from './dto/users-filter.dto';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { RoleService } from './role.service';
import { MobileLoginHistoryDto } from './dto/mobile-login-history.dto';
import { UserGroupMembership } from '../groups/entities/user-group-membership.entity';
import { IUsersService } from './interfaces/users-service.interface';
import { LoginHistoryQueryDto } from '../mobile-apps/dto/login-history-query.dto';
import { PaginatedLoginHistoryDto } from '../mobile-apps/dto/paginated-login-history.dto';
import * as bcrypt from 'bcrypt';

interface MobileLoginInfo {
  lastMobileLoginAt: string | null;
  lastMobileDeviceId: string | null;
  lastMobileAppName: string | null;
  lastMobileAppVersion: string | null;
  lastMobileAppModule: string | null;
}

interface UserFactoryData {
  username: string;
  full_name: string;
  dept_no: string;
  dept_name: string;
}

@Injectable()
export class UsersService implements IUsersService {
  private readonly shouldHashPassword: boolean;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepo: Repository<LoginHistory>,
    @InjectRepository(UserGroupMembership)
    private readonly membershipRepository: Repository<UserGroupMembership>,
    private jwtService: JwtService,
  ) {
    this.shouldHashPassword = process.env.FEATURE_HASHED === 'true';
  }

  async create(
    createUserDto: CreateUserDto,
    creatorRole?: string,
  ): Promise<User> {
    const {
      username,
      password,
      fullName,
      deptNo,
      deptName,
      role = 'user',
      isActive = true,
    } = createUserDto;

    this.validateRoleCreation(role, creatorRole);
    const finalPassword = await this.processPassword(password);

    const user = this.usersRepository.create({
      id: IdGenerator.generateUserId(),
      username,
      password: finalPassword,
      fullName,
      deptNo,
      deptName,
      role,
      isActive,
    });

    try {
      const result = await this.usersRepository.save(user);
      this.logPasswordVerification(username, password, finalPassword);
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  private async processPassword(password: string): Promise<string> {
    return this.shouldHashPassword ? await bcrypt.hash(password, 10) : password;
  }

  private logPasswordVerification(
    username: string,
    originalPassword: string,
    hashedPassword: string,
  ): void {
    if (!this.shouldHashPassword) return;

    console.log(
      'Hash test - immediate compare:',
      bcrypt.compareSync(originalPassword, hashedPassword),
    );

    void this.usersRepository
      .findOne({ where: { username } })
      .then((retrieved) => {
        console.log(
          'Retrieved matches saved:',
          hashedPassword === retrieved?.password,
        );
      });
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

  private async getLatestMobileLoginForUser(
    userId: string,
  ): Promise<MobileLoginInfo> {
    const latest = await this.loginHistoryRepo.findOne({
      where: { accountId: userId },
      order: { loginAt: 'DESC' },
      select: ['loginAt', 'appId', 'appName', 'appVersion', 'appModule'],
    });

    return {
      lastMobileLoginAt: latest?.loginAt
        ? formatDateUTC8(latest.loginAt)
        : null,
      lastMobileDeviceId: latest?.appId ?? null,
      lastMobileAppName: latest?.appName ?? null,
      lastMobileAppVersion: latest?.appVersion ?? null,
      lastMobileAppModule: latest?.appModule ?? null,
    };
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return this.formatUsersWithMobileData(users);
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

    const queryBuilder = this.buildFilteredQuery({
      search,
      role,
      isActive,
      deptNo,
      sortBy,
      sortOrder,
    });

    const total = await queryBuilder.getCount();
    const users = await this.applyPagination(
      queryBuilder,
      page,
      limit,
    ).getMany();
    const formattedUsers = await this.formatUsersWithMobileData(
      users as User[],
    );

    return {
      users: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private buildFilteredQuery(filters: {
    search?: string;
    role?: string;
    isActive?: string;
    deptNo?: string;
    sortBy: string;
    sortOrder: string;
  }) {
    const { search, role, isActive, deptNo, sortBy, sortOrder } = filters;
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where(
        '(user.username LIKE :search OR user.fullName LIKE :search OR user.deptName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', {
        isActive: isActive === 'true',
      });
    }

    if (deptNo) {
      queryBuilder.andWhere('user.deptNo = :deptNo', { deptNo });
    }

    return queryBuilder.orderBy(`user.${sortBy}`, sortOrder as 'ASC' | 'DESC');
  }

  private applyPagination(queryBuilder: any, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return queryBuilder.skip(offset).take(limit);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.findUserByIdOrThrow(id);
    return this.formatUserWithMobileData(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    creatorRole?: string,
  ): Promise<UserResponseDto> {
    const existingUser = await this.findUserByIdOrThrow(id);

    this.validateRoleChange(updateUserDto.role, existingUser.role, creatorRole);

    await this.usersRepository.update(id, updateUserDto);
    const updatedUser = await this.findUserByIdOrThrow(id);
    return this.formatUserWithMobileData(updatedUser);
  }

  private validateRoleChange(
    newRole?: string,
    currentRole?: string,
    creatorRole?: string,
  ): void {
    if (newRole && newRole !== currentRole) {
      if (!RoleService.canEditUserRole(creatorRole as UserRole)) {
        throw new BadRequestException(
          'Only administrators can change user roles',
        );
      }
    }
  }

  async remove(id: string): Promise<void> {
    await this.findUserByIdOrThrow(id);
    await this.usersRepository.delete(id);
  }

  async findByUsername(username: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) return null;

    return this.formatUserWithMobileData(user);
  }

  async validateUserCredentials(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {

    const user = await this.usersRepository.findOne({
      where: { username, isActive: true },
    });

    if (!user) return null;

    const isValidPassword = await this.verifyPassword(password, user.password);

    if (!isValidPassword) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result as Omit<User, 'password'>;
  }

  private async verifyPassword(
    inputPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    return this.shouldHashPassword
      ? await bcrypt.compare(inputPassword, storedPassword)
      : inputPassword === storedPassword;
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;

    return this.formatUserWithMobileData(user);
  }

  async findRawById(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const finalPassword = await this.processPassword(newPassword);
    await this.usersRepository.update(id, { password: finalPassword });
  }

  async toggleUserStatus(id: string): Promise<UserResponseDto> {
    const user = await this.findRawById(id);
    const newStatus = !user.isActive;

    await this.usersRepository.update(id, { isActive: newStatus });
    const updatedUser = await this.findUserByIdOrThrow(id);

    return this.formatUserWithMobileData(updatedUser);
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

    return this.formatUsersWithMobileData(users);
  }

  async login(
    user: User,
  ): Promise<{ access_token: string; user: UserResponseDto }> {
    await this.usersRepository.update(user.id, { lastLoginAt: new Date() });

    const updatedUser = await this.findUserByIdOrThrow(user.id);
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
        lastLoginAt: updatedUser.lastLoginAt
          ? formatDateUTC8(updatedUser.lastLoginAt)
          : null,
        createdAt: user.createdAt ? formatDateUTC8(user.createdAt) : null,
        updatedAt: user.updatedAt ? formatDateUTC8(user.updatedAt) : null,
      } as UserResponseDto,
    };
  }

  async updateProfile(
    id: string,
    updateProfileDto: { fullName: string },
  ): Promise<UserResponseDto> {
    await this.findUserByIdOrThrow(id);
    await this.usersRepository.update(id, updateProfileDto);
    const updatedUser = await this.findUserByIdOrThrow(id);

    return this.formatUserWithMobileData(updatedUser);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.findRawById(id);

    const isValidCurrentPassword = await this.verifyPassword(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isValidCurrentPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    const finalPassword = await this.processPassword(
      changePasswordDto.newPassword,
    );
    await this.usersRepository.update(id, { password: finalPassword });

    return { message: 'Password changed successfully' };
  }

  async getFactoryUsers(): Promise<FactoryUserDto[]> {
    try {
      const result = await this.usersRepository.query(
        'EXEC ACM_FACTORY_USER_ACCOUNT',
      );

      return this.transformFactoryUsers(result as UserFactoryData[]);
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

  private transformFactoryUsers(rawData: UserFactoryData[]): FactoryUserDto[] {
    return rawData.map((item) => ({
      username: item.username || '',
      fullName: item.full_name || '',
      deptNo: item.dept_no || '',
      deptName: item.dept_name || '',
    }));
  }

  async getFactoryDepartments(): Promise<FactoryDepartmentDto[]> {
    try {
      const result = await this.usersRepository.query('EXEC ACM_FACTORY_DEPT');
      return this.transformFactoryDepartments(result as UserFactoryData[]);
    } catch (error) {
      console.error('Error executing ACM_FACTORY_DEPT procedure:', error);
      throw new BadRequestException(
        'Failed to retrieve factory departments. Please try again later.',
      );
    }
  }

  private transformFactoryDepartments(
    rawData: UserFactoryData[],
  ): FactoryDepartmentDto[] {
    return rawData.map((item) => ({
      deptNo: item.dept_no || '',
      deptName: item.dept_name || '',
    }));
  }

  async findLoginHistoryByUserId(
    userId: string,
    limit = 100,
  ): Promise<{
    items: MobileLoginHistoryDto[];
  }> {
    const limitInt = Math.max(1, Math.floor(limit));

    const rows = await this.loginHistoryRepo.find({
      where: { accountId: userId },
      order: { loginAt: 'DESC' },
      take: limitInt,
      select: [
        'key',
        'loginAt',
        'success',
        'failureReason',
        'appId',
        'appName',
        'appVersion',
        'appModule',
      ],
    });

    const items = rows.map((row) => ({
      userId,
      logId: row.key,
      loginAt: row.loginAt ? formatDateUTC8(row.loginAt) : null,
      success: !!row.success,
      failureReason: row.failureReason ?? null,
      deviceId: row.appId ?? null,
      appName: row.appName ?? null,
      appVersion: row.appVersion ?? null,
      appModule: row.appModule ?? null,
    }));

    return { items };
  }

  async findLoginHistoryByDeviceId(
    appId: string,
    query: LoginHistoryQueryDto,
  ): Promise<PaginatedLoginHistoryDto> {
    const { page = 1, limit = 50, startDate, endDate, deviceId } = query;

    // Build query: when deviceId provided, match exact device id; otherwise match all devices of app
    const queryBuilder =
      this.loginHistoryRepo.createQueryBuilder('loginHistory');
    if (deviceId) {
      queryBuilder.where('loginHistory.appId = :deviceId', { deviceId });
    } else {
      queryBuilder.where('loginHistory.appId LIKE :appIdLike', {
        appIdLike: `${appId}@%`,
      });
    }

    // Add date range filtering if provided
    if (startDate) {
      queryBuilder.andWhere('loginHistory.loginAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('loginHistory.loginAt <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const skip = (page - 1) * limit;
    const loginHistoryRecords = await queryBuilder
      .orderBy('loginHistory.loginAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      data: loginHistoryRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Helper methods
  private async findUserByIdOrThrow(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  private async formatUsersWithMobileData(
    users: User[],
  ): Promise<UserResponseDto[]> {
    const usersWithMobile = await Promise.all(
      users.map(async (user) => {
        const mobile = await this.getLatestMobileLoginForUser(user.id);
        return { ...user, ...mobile };
      }),
    );

    return usersWithMobile.map(this.formatUserDates) as UserResponseDto[];
  }

  private async formatUserWithMobileData(user: User): Promise<UserResponseDto> {
    const mobile = await this.getLatestMobileLoginForUser(user.id);
    const userWithMobile = { ...user, ...mobile };
    return this.formatUserDates(userWithMobile) as UserResponseDto;
  }

  async getUserGroups(userId: string): Promise<any[]> {
    const memberships = await this.membershipRepository
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.group', 'group')
      .where('membership.userId = :userId', { userId })
      .andWhere('group.isActive = :isActive', { isActive: true })
      .orderBy('group.name', 'ASC')
      .getMany();

    return memberships.map((membership) => ({
      id: membership.group.id,
      name: membership.group.name,
      description: membership.group.description,
      isActive: membership.group.isActive,
      memberCount: 0, // TODO: Add member count query
      membershipCreatedAt: membership.createdAt,
    }));
  }

  private formatUserDates(user: Partial<User>): Partial<UserResponseDto> {
    return {
      ...user,
      lastLoginAt: user.lastLoginAt ? formatDateUTC8(user.lastLoginAt) : null,
      createdAt: user.createdAt ? formatDateUTC8(user.createdAt) : null,
      updatedAt: user.updatedAt ? formatDateUTC8(user.updatedAt) : null,
    };
  }
}
