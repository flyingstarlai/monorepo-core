import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
} from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  deptNo: string;

  @IsString()
  @IsNotEmpty()
  deptName: string;

  @IsString()
  @IsOptional()
  parentDeptNo?: string;

  @IsInt()
  @IsOptional()
  deptLevel?: number;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  deptName?: string;

  @IsString()
  @IsOptional()
  parentDeptNo?: string;

  @IsInt()
  @IsOptional()
  deptLevel?: number;

  @IsString()
  @IsOptional()
  managerId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class DepartmentDto {
  deptNo: string;
  deptName: string;
  parentDeptNo: string | null;
  deptLevel: number;
  managerId: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}
