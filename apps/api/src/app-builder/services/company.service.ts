import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyDto,
} from '../dto/company.dto';
import { MobileAppDefinition } from '../entities/app-definition.entity';
import { formatDateUTC8 } from '../../utils/date-formatter';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async findAll(): Promise<CompanyDto[]> {
    try {
      const companies = await this.companyRepository.find({
        order: { createdAt: 'DESC' },
      });

      return companies.map((company) => ({
        companyCode: company.companyCode,
        companyName: company.companyName,
        isActive: company.isActive,
        createdAt: company.createdAt ? formatDateUTC8(company.createdAt) : null,
        updatedAt: company.updatedAt ? formatDateUTC8(company.updatedAt) : null,
      }));
    } catch (error) {
      console.error('Error retrieving all companies:', error);
      throw new BadRequestException(
        'Failed to retrieve companies. Please try again later.',
      );
    }
  }

  async findById(companyCode: string): Promise<CompanyDto> {
    try {
      const company = await this.companyRepository.findOne({
        where: { companyCode },
      });

      if (!company) {
        throw new NotFoundException(
          `Company with code ${companyCode} not found`,
        );
      }

      return {
        companyCode: company.companyCode,
        companyName: company.companyName,
        isActive: company.isActive,
        createdAt: company.createdAt ? formatDateUTC8(company.createdAt) : null,
        updatedAt: company.updatedAt ? formatDateUTC8(company.updatedAt) : null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error retrieving company:', error);
      throw new BadRequestException(
        'Failed to retrieve company. Please try again later.',
      );
    }
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<CompanyDto> {
    try {
      const existingCompany = await this.companyRepository.findOne({
        where: { companyCode: createCompanyDto.companyCode },
      });

      if (existingCompany) {
        throw new BadRequestException(
          `Company with code ${createCompanyDto.companyCode} already exists`,
        );
      }

      const company = this.companyRepository.create({
        companyCode: createCompanyDto.companyCode,
        companyName: createCompanyDto.companyName,
        isActive: createCompanyDto.isActive ?? true,
      });

      const savedCompany = await this.companyRepository.save(company);

      return {
        companyCode: savedCompany.companyCode,
        companyName: savedCompany.companyName,
        isActive: savedCompany.isActive,
        createdAt: savedCompany.createdAt
          ? formatDateUTC8(savedCompany.createdAt)
          : null,
        updatedAt: savedCompany.updatedAt
          ? formatDateUTC8(savedCompany.updatedAt)
          : null,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating company:', error);
      throw new BadRequestException(
        'Failed to create company. Please try again later.',
      );
    }
  }

  async update(
    companyCode: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyDto> {
    try {
      const company = await this.companyRepository.findOne({
        where: { companyCode },
      });

      if (!company) {
        throw new NotFoundException(
          `Company with code ${companyCode} not found`,
        );
      }

      Object.assign(company, updateCompanyDto);

      const savedCompany = await this.companyRepository.save(company);

      return {
        companyCode: savedCompany.companyCode,
        companyName: savedCompany.companyName,
        isActive: savedCompany.isActive,
        createdAt: savedCompany.createdAt
          ? formatDateUTC8(savedCompany.createdAt)
          : null,
        updatedAt: savedCompany.updatedAt
          ? formatDateUTC8(savedCompany.updatedAt)
          : null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating company:', error);
      throw new BadRequestException(
        'Failed to update company. Please try again later.',
      );
    }
  }

  async delete(companyCode: string): Promise<{ message: string }> {
    try {
      const company = await this.companyRepository.findOne({
        where: { companyCode },
        relations: ['appDefinitions'],
      });

      if (!company) {
        throw new NotFoundException(
          `Company with code ${companyCode} not found`,
        );
      }

      if (company.appDefinitions && company.appDefinitions.length > 0) {
        throw new BadRequestException(
          `Cannot delete company with code ${companyCode} because it has ${company.appDefinitions.length} app definition(s) assigned to it.`,
        );
      }

      await this.companyRepository.delete(companyCode);

      return { message: 'Company deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error deleting company:', error);
      throw new BadRequestException(
        'Failed to delete company. Please try again later.',
      );
    }
  }
}
