import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MobileAppGoogleServicesService } from '../services/app-google-services.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

export interface AppIdDto {
  appId: string;
  packageName: string;
}

@ApiTags('Mobile App Builder - App IDs')
@Controller('app-builder/app-ids')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MobileAppAppIdsController {
  constructor(
    private readonly googleServicesService: MobileAppGoogleServicesService,
  ) {}

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Get list of available APP_IDs from Google Services',
  })
  @ApiResponse({
    status: 200,
    description: 'List of APP_IDs',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          appId: { type: 'string' },
          packageName: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getAppIds(): Promise<AppIdDto[]> {
    const identifiers = await this.googleServicesService.getIdentifiers();

    return identifiers.map((identifier) => ({
      appId: identifier.appId,
      packageName: identifier.packageName,
    }));
  }
}
