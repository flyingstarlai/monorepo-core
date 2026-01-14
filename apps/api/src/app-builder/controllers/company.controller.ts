import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompanyService } from '../services/company.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyDto,
} from '../dto/company.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Company Management')
@Controller('app-builder/companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'List of all companies' })
  async findAll(): Promise<CompanyDto[]> {
    return await this.companyService.findAll();
  }

  @Get(':companyCode')
  @ApiOperation({ summary: 'Get company by code' })
  @ApiParam({ name: 'companyCode', description: 'Company code' })
  @ApiResponse({ status: 200, description: 'Company details' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findById(
    @Param('companyCode') companyCode: string,
  ): Promise<CompanyDto> {
    return await this.companyService.findById(companyCode);
  }

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<CompanyDto> {
    return await this.companyService.create(createCompanyDto);
  }

  @Put(':companyCode')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update company' })
  @ApiParam({ name: 'companyCode', description: 'Company code' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async update(
    @Param('companyCode') companyCode: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyDto> {
    return await this.companyService.update(companyCode, updateCompanyDto);
  }

  @Patch(':companyCode/toggle-active')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Toggle company active status' })
  @ApiParam({ name: 'companyCode', description: 'Company code' })
  @ApiResponse({
    status: 200,
    description: 'Company status toggled successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async toggleActive(
    @Param('companyCode') companyCode: string,
  ): Promise<CompanyDto> {
    const company = await this.companyService.findById(companyCode);
    return await this.companyService.update(companyCode, {
      isActive: !company.isActive,
    });
  }

  @Delete(':companyCode')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete company' })
  @ApiParam({ name: 'companyCode', description: 'Company code' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async delete(@Param('companyCode') companyCode: string): Promise<{
    message: string;
  }> {
    return await this.companyService.delete(companyCode);
  }
}
