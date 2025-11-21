import { IsString, IsNotEmpty } from 'class-validator';

export class FactoryDepartmentDto {
  @IsString()
  @IsNotEmpty()
  deptNo: string;

  @IsString()
  @IsNotEmpty()
  deptName: string;
}
