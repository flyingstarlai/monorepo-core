import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  BadRequestException,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersFilterDto } from './dto/users-filter.dto';
import { FactoryUserDto } from './dto/factory-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Request() req: { user: User }) {
    const creatorRole = req.user?.role;
    return this.usersService.create(createUserDto, creatorRole);
  }

  @Get()
  findAll(@Query() filters: UsersFilterDto, @Request() req: { user: User }) {
    const userRole = req.user?.role;

    if (!RoleService.canAccessUserManagement(userRole)) {
      throw new BadRequestException(
        'Insufficient permissions to access user management',
      );
    }

    return this.usersService.findWithFilters(filters);
  }

  @Get('search')
  search(@Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    return this.usersService.searchUsers(query);
  }

  @Get('factory')
  async getFactoryUsers(): Promise<FactoryUserDto[]> {
    try {
      return await this.usersService.getFactoryUsers();
    } catch (error) {
      console.error('Factory users endpoint error:', error);
      throw error;
    }
  }

  @Get('profile')
  async getProfile(@Request() req) {
    if (!req.user) {
      throw new NotFoundException('User profile not found');
    }
    const { password: _, ...result } = req.user;
    return result;
  }

  @Put('profile')
  async updateProfile(
    @Request() req: { user: User },
    @Body() updateProfileDto: { fullName: string },
  ) {
    if (!req.user || !req.user.id) {
      throw new NotFoundException('User not found');
    }
    try {
      return await this.usersService.updateProfile(
        req.user.id,
        updateProfileDto,
      );
    } catch {
      throw new BadRequestException('Failed to update profile');
    }
  }

  @Put('change-password')
  async changePassword(
    @Request() req: { user: User },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new NotFoundException('User not found');
    }
    try {
      return await this.usersService.changePassword(
        req.user.id,
        changePasswordDto,
      );
    } catch {
      throw new BadRequestException('Failed to change password');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: User },
  ) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const creatorRole = req.user?.role;
      return this.usersService.update(id, updateUserDto, creatorRole);
    } catch {
      throw new BadRequestException('Failed to update user');
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: User }) {
    try {
      const deleterRole = req.user?.role;

      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (req.user?.id === id) {
        throw new BadRequestException('Cannot delete your own account');
      }

      if (!RoleService.canDeleteUserWithRole(deleterRole, user.role)) {
        throw new BadRequestException(
          `Insufficient permissions to delete users with role '${user.role}'`,
        );
      }

      await this.usersService.remove(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Delete user error:', error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to delete user',
      );
    }
  }
}
