import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import {
  User,
  UserRole,
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  UsersFilterDto,
} from '@repo/api';
import { formatDateUTC8 } from '../utils/date-formatter';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { RoleService } from './role.service';
import { IdGenerator } from '../utils/id-generator';
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
    const {
      username,
      password,
      fullName,
      role = UserRole.USER,
    } = createUserDto;

    this.validateRoleCreation(role, creatorRole);

    const finalPassword = await this.processPassword(password);

    const user = this.usersRepository.create({
      id: IdGenerator.generateUserId(),
      username,
      password: finalPassword,
      fullName,
      role,
    });

    try {
      const result = await this.usersRepository.save(user);
      return result;
    } catch (error) {
      throw new BadRequestException(
        `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private validateRoleCreation(role: string, creatorRole?: string): void {
    if (
      !RoleService.canCreateUserWithRole(
        creatorRole as UserRole,
        role as UserRole,
      )
    ) {
      throw new BadRequestException(
        `Insufficient permissions to create users with role '${role}'`,
      );
    }
  }

  private async processPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  private async verifyPassword(
    plainPassword: string,
    storedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, storedPassword);
  }

  async findOne(id: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;

    return this.mapToResponseDto(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findWithFilters(
    filters: UsersFilterDto,
  ): Promise<{ users: UserResponseDto[]; total: number }> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (filters.search) {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.fullName LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users: users.map((user) => this.mapToResponseDto(user)),
      total,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    updaterRole?: string,
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.role && updaterRole) {
      if (!RoleService.canEditUserRole(updaterRole as UserRole)) {
        throw new BadRequestException(
          'Insufficient permissions to edit user role',
        );
      }
      if (
        !RoleService.canCreateUserWithRole(
          updaterRole as UserRole,
          updateUserDto.role as UserRole,
        )
      ) {
        throw new BadRequestException(
          `Insufficient permissions to assign role '${updateUserDto.role}'`,
        );
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.processPassword(
        updateUserDto.password,
      );
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    return this.mapToResponseDto(updatedUser);
  }

  async updateProfile(
    id: string,
    updateProfileDto: { fullName: string },
  ): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.fullName = updateProfileDto.fullName;
    const updatedUser = await this.usersRepository.save(user);
    return this.mapToResponseDto(updatedUser);
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isCurrentPasswordValid = await this.verifyPassword(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const isSamePassword = await this.verifyPassword(
      changePasswordDto.newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const newProcessedPassword = await this.processPassword(
      changePasswordDto.newPassword,
    );
    user.password = newProcessedPassword;
    await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.usersRepository.remove(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
    return users.map((user) => this.mapToResponseDto(user));
  }

  async searchUsers(query: string): Promise<UserResponseDto[]> {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.username LIKE :query OR user.fullName LIKE :query', {
        query: `%${query}%`,
      })
      .getMany();
    return users.map((user) => this.mapToResponseDto(user));
  }

  async validateUserCredentials(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) return null;

    return user;
  }

  async login(user: User): Promise<{ user: User }> {
    return { user };
  }

  async findRawById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  private mapToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt ? formatDateUTC8(user.createdAt) : null,
      updatedAt: user.updatedAt ? formatDateUTC8(user.updatedAt) : null,
    };
  }
}
