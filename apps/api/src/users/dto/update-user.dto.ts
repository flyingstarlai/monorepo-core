import {
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Password must be at least 3 characters' })
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  fullName?: string;

  @IsOptional()
  @IsString()
  deptNo?: string;

  @IsOptional()
  @IsString()
  deptName?: string;

  @IsOptional()
  @IsEnum(['admin', 'manager', 'user'])
  role?: 'admin' | 'manager' | 'user';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
