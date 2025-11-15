import { IsString, IsNotEmpty } from 'class-validator';

export class FactoryUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  dept_no: string;

  @IsString()
  @IsNotEmpty()
  dept_name: string;
}
