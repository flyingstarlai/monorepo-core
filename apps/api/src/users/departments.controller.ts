import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentDto,
} from './dto/department.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('admin', 'manager')
  async findAll(): Promise<DepartmentDto[]> {
    return await this.usersService.findAllDepartments();
  }

  @Get(':deptNo')
  @Roles('admin', 'manager')
  async findOne(@Param('deptNo') deptNo: string): Promise<DepartmentDto> {
    return await this.usersService.findOneDepartment(deptNo);
  }

  @Post()
  @Roles('admin', 'manager')
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentDto> {
    return await this.usersService.createDepartment(createDepartmentDto);
  }

  @Put(':deptNo')
  @Roles('admin', 'manager')
  async update(
    @Param('deptNo') deptNo: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentDto> {
    return await this.usersService.updateDepartment(
      deptNo,
      updateDepartmentDto,
    );
  }

  @Patch(':deptNo/toggle-active')
  @Roles('admin', 'manager')
  async toggleActive(@Param('deptNo') deptNo: string): Promise<DepartmentDto> {
    return await this.usersService.toggleDepartmentActive(deptNo);
  }

  @Delete(':deptNo')
  @Roles('admin', 'manager')
  async remove(@Param('deptNo') deptNo: string): Promise<{ message: string }> {
    await this.usersService.removeDepartment(deptNo);
    return { message: 'Department deleted successfully' };
  }
}
