import { IsString, IsOptional } from 'class-validator';

export class UserResponseDto {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  fullName: string;

  @IsString()
  role: 'admin' | 'manager' | 'user';

  @IsString()
  deptNo: string;

  @IsString()
  deptName: string;

  isActive: boolean;

  @IsString()
  @IsOptional()
  lastLoginAt?: string | null;

  @IsString()
  @IsOptional()
  createdAt?: string | null;

  @IsString()
  @IsOptional()
  updatedAt?: string | null;
}
