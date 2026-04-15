import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type User, CreateUserDto, UserResponseDto } from '@repo/api';
import { UsersService } from '../users/users.service';
import { formatDateUTC8 } from '../utils/date-formatter';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    return await this.usersService.validateUserCredentials(username, password);
  }

  async login(user: User) {
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
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt ? formatDateUTC8(user.createdAt) : null,
      } as UserResponseDto,
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return { message: 'User created successfully', user };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersService.findRawById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    await this.usersService.changePassword(userId, {
      currentPassword,
      newPassword,
    });
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const user = await this.usersService.findOne(payload.sub as string);
      if (!user) {
        throw new UnauthorizedException('User not found');
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
