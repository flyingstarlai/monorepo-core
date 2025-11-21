import {
  Controller,
  Get,
  UseGuards,
  ForbiddenException,
  Req,
  Param,
  Query,
} from '@nestjs/common';
import { MobileAppsService } from './mobile-apps.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';
import { RoleService } from '../users/role.service';
import { LoginHistoryQueryDto } from './dto/login-history-query.dto';

@Controller('mobile-apps')
@UseGuards(JwtAuthGuard)
export class MobileAppsController {
  constructor(private readonly mobileAppsService: MobileAppsService) {}

  @Get()
  async getMobileAppsOverview(@Req() req: { user: User }) {
    const userRole = req.user?.role;

    // Check if user has required role
    if (!RoleService.hasAnyRole(userRole, ['admin', 'manager'])) {
      throw new ForbiddenException(
        'Insufficient permissions to access mobile apps overview',
      );
    }

    return this.mobileAppsService.getMobileAppsOverview();
  }

  @Get(':id/login-history')
  async getLoginHistoryByAppId(
    @Param('id') appId: string,
    @Query() query: LoginHistoryQueryDto,
    @Req() req: { user: User },
  ) {
    const userRole = req.user?.role;

    // Check if user has required role
    if (!RoleService.hasAnyRole(userRole, ['admin', 'manager'])) {
      throw new ForbiddenException(
        'Insufficient permissions to access login history',
      );
    }

    return this.mobileAppsService.getLoginHistoryByAppId(appId, query);
  }
}
