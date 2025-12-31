import {
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(3)
  password: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  deptNo?: string;

  @IsOptional()
  @IsString()
  deptName?: string;

  @IsOptional()
  @IsString()
  role?: 'admin' | 'manager' | 'user';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  signLevel?: number;
}
