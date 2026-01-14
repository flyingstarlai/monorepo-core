import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  companyCode: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CompanyDto {
  companyCode: string;
  companyName: string;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
