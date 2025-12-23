import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DocumentKindsService } from './document-kinds.service';
import { CreateDocumentKindDto } from './dto/create-document-kind.dto';
import { UpdateDocumentKindDto } from './dto/update-document-kind.dto';
import { DocumentKindResponseDto } from './dto/document-kind-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Document Kinds')
@Controller('document-kinds')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentKindsController {
  private readonly logger = new Logger(DocumentKindsController.name);

  constructor(private readonly documentKindsService: DocumentKindsService) {}

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all document kinds' })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Get only active document kinds',
  })
  @ApiResponse({
    status: 200,
    description: 'List of document kinds',
    type: [DocumentKindResponseDto],
  })
  async findAll(
    @Query('activeOnly') activeOnly?: boolean,
  ): Promise<DocumentKindResponseDto[]> {
    this.logger.log(`Getting document kinds with activeOnly=${activeOnly}`);

    if (activeOnly === true) {
      return this.documentKindsService.findActive();
    }

    return this.documentKindsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get document kind by ID' })
  @ApiParam({ name: 'id', description: 'Document kind ID' })
  @ApiResponse({
    status: 200,
    description: 'Document kind details',
    type: DocumentKindResponseDto,
  })
  async findOne(@Param('id') id: number): Promise<DocumentKindResponseDto> {
    this.logger.log(`Getting document kind with ID: ${id}`);
    return this.documentKindsService.findOne(id);
  }

  @Get('code/:code')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get document kind by code' })
  @ApiParam({ name: 'code', description: 'Document kind code' })
  @ApiResponse({
    status: 200,
    description: 'Document kind details',
    type: DocumentKindResponseDto,
  })
  async findByCode(
    @Param('code') code: string,
  ): Promise<DocumentKindResponseDto> {
    this.logger.log(`Getting document kind with code: ${code}`);
    return this.documentKindsService.findByCode(code);
  }

  @Post()
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new document kind' })
  @ApiResponse({
    status: 201,
    description: 'Document kind created',
    type: DocumentKindResponseDto,
  })
  async create(
    @Req() req: any,
    @Body() createDocumentKindDto: CreateDocumentKindDto,
  ): Promise<DocumentKindResponseDto> {
    this.logger.log(`Creating document kind: ${createDocumentKindDto.code}`);

    const user = req.user as User;
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    return this.documentKindsService.create(createDocumentKindDto, user.id);
  }

  @Put(':id')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update document kind' })
  @ApiParam({ name: 'id', description: 'Document kind ID' })
  @ApiResponse({
    status: 200,
    description: 'Document kind updated',
    type: DocumentKindResponseDto,
  })
  async update(
    @Req() req: any,
    @Param('id') id: number,
    @Body() updateDocumentKindDto: UpdateDocumentKindDto,
  ): Promise<DocumentKindResponseDto> {
    this.logger.log(`Updating document kind with ID: ${id}`);

    const user = req.user as User;
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    return this.documentKindsService.update(id, updateDocumentKindDto, user.id);
  }

  @Put(':id/toggle-active')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle document kind active status' })
  @ApiParam({ name: 'id', description: 'Document kind ID' })
  @ApiResponse({
    status: 200,
    description: 'Document kind active status toggled',
    type: DocumentKindResponseDto,
  })
  async toggleActive(
    @Req() req: any,
    @Param('id') id: number,
  ): Promise<DocumentKindResponseDto> {
    this.logger.log(`Toggling active status for document kind with ID: ${id}`);

    const user = req.user as User;
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    return this.documentKindsService.toggleActive(id, user.id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete document kind' })
  @ApiParam({ name: 'id', description: 'Document kind ID' })
  @ApiResponse({ status: 204, description: 'Document kind deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    this.logger.log(`Deleting document kind with ID: ${id}`);
    await this.documentKindsService.remove(id);
  }
}
