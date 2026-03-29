import { IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: 'admin' | 'user';
}
