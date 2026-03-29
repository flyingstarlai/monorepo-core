import { IsString, IsOptional } from 'class-validator';
export class UserResponseDto {
  @IsString()
  id: string;
  @IsString()
  username: string;
  @IsString()
  fullName: string;
  role: 'admin' | 'user';
  @IsString()
  @IsOptional()
  createdAt?: string | null;
  @IsString()
  @IsOptional()
  updatedAt?: string | null;
}
