import { PaginatedLoginHistoryDto } from '../../mobile-apps/dto/paginated-login-history.dto';
import { LoginHistoryQueryDto } from '../../mobile-apps/dto/login-history-query.dto';
import { DepartmentDto } from '../dto/department.dto';

export interface IUsersService {
  findLoginHistoryByDeviceId(
    appId: string,
    query: LoginHistoryQueryDto,
  ): Promise<PaginatedLoginHistoryDto>;

  getFactoryDepartments(): Promise<DepartmentDto[]>;
  findAllDepartments(): Promise<DepartmentDto[]>;
  findOneDepartment(deptNo: string): Promise<DepartmentDto>;
  createDepartment(createDepartmentDto: any): Promise<DepartmentDto>;
  updateDepartment(
    deptNo: string,
    updateDepartmentDto: any,
  ): Promise<DepartmentDto>;
  toggleDepartmentActive(deptNo: string): Promise<DepartmentDto>;
  removeDepartment(deptNo: string): Promise<void>;
}
