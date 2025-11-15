import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

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
}
