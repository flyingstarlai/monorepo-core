import { IsString, MinLength, IsIn } from 'class-validator';

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

  @IsIn(['admin', 'manager', 'user'])
  role: 'admin' | 'manager' | 'user';
}
