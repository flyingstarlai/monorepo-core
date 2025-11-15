import { IsString, IsNotEmpty } from 'class-validator';

export class FactoryDepartmentDto {
  @IsString()
  @IsNotEmpty()
  dept_no: string;

  @IsString()
  @IsNotEmpty()
  dept_name: string;
}
