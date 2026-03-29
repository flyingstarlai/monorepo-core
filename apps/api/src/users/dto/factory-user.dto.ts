import { IsString, IsNotEmpty } from 'class-validator';

export class FactoryUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;
}
