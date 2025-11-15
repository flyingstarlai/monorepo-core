import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import type { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('create-user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.authService.createUser(createUserDto);
      return { message: 'User created successfully', user };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create user',
      );
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: User }) {
    try {
      // The LocalAuthGuard validates credentials and attaches user to req.user
      const user = req.user;

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.authService.login(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Login failed',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req: { body: { refreshToken: string } }) {
    try {
      const refreshToken = req.body.refreshToken;
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is required');
      }

      return await this.authService.refreshToken(refreshToken);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Failed to refresh token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: User }) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req: { user: User },
    @Body()
    changePasswordDto: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    try {
      await this.authService.changePassword(
        req.user.id,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to change password');
    }
  }
}
