import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MobileAppGoogleServicesService } from '../services/app-google-services.service';
import { UploadGoogleServicesDto } from '../dto/upload-google-services.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { User } from '../../users/entities/user.entity';

@ApiTags('Mobile App Builder - Google Services')
@Controller('app-builder/google-services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MobileAppGoogleServicesController {
  constructor(
    private readonly googleServicesService: MobileAppGoogleServicesService,
  ) {}

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Upload and extract Google Services identifiers' })
  @ApiResponse({
    status: 201,
    description: 'Identifiers extracted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async uploadGlobal(
    @Body() uploadDto: UploadGoogleServicesDto,
    @Request() req: { user: User },
  ) {
    return this.googleServicesService.uploadGlobal(uploadDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get extracted identifiers' })
  @ApiResponse({ status: 200, description: 'List of extracted identifiers' })
  async getIdentifiers() {
    return this.googleServicesService.getIdentifiers();
  }
}
