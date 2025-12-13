import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
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
import { FactoryDepartmentDto } from './dto/factory-department.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ChangePasswordDto } from '../auth/dto/change-password.dto';
import { MobileLoginHistoryDto } from './dto/mobile-login-history.dto';
import { RoleService } from './role.service';
import { UserGroupResponseDto } from './dto/user-group-response.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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

    // Check if user can access user management
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

  @Get('factory-departments')
  async getFactoryDepartments(): Promise<FactoryDepartmentDto[]> {
    try {
      return await this.usersService.getFactoryDepartments();
    } catch (error) {
      console.error('Factory departments endpoint error:', error);
      throw error;
    }
  }

  @Get('profile')
  async getProfile(@Request() req) {
    if (!req.user) {
      throw new NotFoundException('User profile not found');
    }
    return req.user;
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

  @Patch(':id/status')
  async toggleStatus(@Param('id') id: string, @Request() req: { user: User }) {
    try {
      const userRole = req.user?.role;
      const permissions = RoleService.getPermissions(userRole);

      if (!permissions.canToggleUserStatus) {
        throw new BadRequestException(
          'Insufficient permissions to toggle user status',
        );
      }

      const user = await this.usersService.toggleUserStatus(id);
      return {
        message: `User status updated to ${user.isActive ? 'active' : 'inactive'}`,
        user,
      };
    } catch {
      throw new BadRequestException('Failed to toggle user status');
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

      // Prevent users from deleting themselves
      if (req.user?.id === id) {
        throw new BadRequestException('Cannot delete your own account');
      }

      // Check if deleter can delete user with specific role
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

  @Get(':id/login-history')
  async getLoginHistory(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ): Promise<{
    items: MobileLoginHistoryDto[];
  }> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.usersService.findLoginHistoryByUserId(
      id,
      limit ? Number(limit) : 100,
    );
  }

  @Get(':id/groups')
  @ApiOperation({ summary: 'Get groups for a specific user' })
  @ApiResponse({
    status: 200,
    description: 'List of user groups',
    type: [UserGroupResponseDto],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getUserGroups(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<UserGroupResponseDto[]> {
    // Check if user exists
    const targetUser = await this.usersService.findOne(id);
    if (!targetUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check permissions: users can only see their own groups, admins can see anyone's groups
    const requestingUser = req.user;
    if (requestingUser.role !== 'admin' && requestingUser.id !== id) {
      throw new BadRequestException('You can only view your own groups');
    }

    return this.usersService.getUserGroups(id);
  }
}
