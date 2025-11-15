import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @IsString()
  @MinLength(3, { message: 'New password must be at least 3 characters long' })
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;
}
