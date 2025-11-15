import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    // Delegate validation to users service to ensure consistency
    return await this.usersService.validateUserCredentials(username, password);
  }

  async login(user: User) {
    // Update lastLoginAt timestamp
    const loginResult = await this.usersService.login(user);

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        { expiresIn: '7d' },
      ),
      user: {
        id: user.id,
        username: user.username,
        name: user.fullName,
        role: user.role,
        avatar: null,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: loginResult.user.lastLoginAt,
      },
    };
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async createUser(createUserDto: CreateUserDto) {
    // Hash password before creating user
    const hashedPassword = await this.hashPassword(createUserDto.password);

    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return { message: 'User created successfully', user };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.comparePasswords(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is different from current
    const isSamePassword = await this.comparePasswords(
      newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash new password and update user
    const hashedNewPassword = await this.hashPassword(newPassword);

    await this.usersService.update(userId, {
      password: hashedNewPassword,
    });
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub as string);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        role: user.role,
      };

      return {
        access_token: await this.jwtService.signAsync(newPayload),
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
