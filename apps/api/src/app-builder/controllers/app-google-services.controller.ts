import {
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Request,
  Res,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MobileAppGoogleServicesService } from '../services/app-google-services.service';
import { UploadGoogleServicesDto } from '../dto/upload-google-services.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { User } from '../../users/entities/user.entity';
import { Response } from 'express';

@ApiTags('Mobile App Builder - Google Services')
@Controller('app-builder/google-services')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MobileAppGoogleServicesController {
  constructor(
    private readonly googleServicesService: MobileAppGoogleServicesService,
  ) {}

  private checkFeatureFlag() {
    if (process.env.FEATURE_APP_BUILDER !== 'true') {
      throw new ForbiddenException('App Builder feature is disabled');
    }
  }

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
    this.checkFeatureFlag();
    return this.googleServicesService.uploadGlobal(uploadDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get extracted identifiers' })
  @ApiResponse({ status: 200, description: 'List of extracted identifiers' })
  async getIdentifiers() {
    this.checkFeatureFlag();
    return this.googleServicesService.getIdentifiers();
  }

  @Get('download')
  @ApiOperation({ summary: 'Download google-services.json file' })
  @ApiResponse({
    status: 200,
    description: 'google-services.json file content',
    content: { 'application/json': {} },
  })
  @ApiResponse({
    status: 404,
    description: 'No google-services.json file found',
  })
  async downloadGoogleServices(@Res() res: Response) {
    this.checkFeatureFlag();
    try {
      const fileContent =
        await this.googleServicesService.getGoogleServicesFile();

      if (!fileContent) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'No google-services.json file found',
        });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="google-services.json"',
      );
      res.send(fileContent);
    } catch {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to download google-services.json',
      });
    }
  }
}
