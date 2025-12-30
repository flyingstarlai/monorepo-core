import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DocumentStageService } from './document-stage.service';
import { CreateDocumentStageDto } from './dto/create-document-stage.dto';
import { UpdateDocumentStageDto } from './dto/update-document-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Document Stages')
@Controller('document-stages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DocumentStageController {
  private readonly logger = new Logger(DocumentStageController.name);

  constructor(private readonly documentStageService: DocumentStageService) {}

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all document stages' })
  @ApiResponse({
    status: 200,
    description: 'List of document stages ordered by sort_order',
    type: [Object],
  })
  async findAll() {
    return this.documentStageService.findAll();
  }

  @Post()
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new document stage' })
  @ApiResponse({
    status: 201,
    description: 'Stage created successfully',
    type: Object,
  })
  async create(@Body() dto: CreateDocumentStageDto) {
    this.logger.log(`Creating document stage: ${dto.title}`);
    return this.documentStageService.create(dto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update document stage' })
  @ApiParam({ name: 'id', description: 'Stage ID' })
  @ApiResponse({
    status: 200,
    description: 'Stage updated successfully',
    type: Object,
  })
  async update(@Param('id') id: string, @Body() dto: UpdateDocumentStageDto) {
    this.logger.log(`Updating document stage ${id}`);
    return this.documentStageService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete document stage' })
  @ApiParam({ name: 'id', description: 'Stage ID' })
  @ApiResponse({ status: 204, description: 'Stage deleted successfully' })
  async remove(@Param('id') id: string) {
    this.logger.log(`Deleting document stage ${id}`);
    await this.documentStageService.remove(id);
  }
}
