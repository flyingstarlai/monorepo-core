import {
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  IsEmail,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(3)
  password: string;

  @IsString()
  fullName: string;

  @IsString()
  deptNo: string;

  @IsString()
  deptName: string;

  @IsOptional()
  @IsString()
  role?: 'admin' | 'manager' | 'user';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  signLevel?: number;
}
