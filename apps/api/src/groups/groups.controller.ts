import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateGroupMembersDto } from './dto/update-group-members.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('User Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createDto: CreateGroupDto) {
    return this.groupsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Get(':id/users')
  listMembers(@Param('id') id: string) {
    return this.groupsService.listMembers(id);
  }

  @Post(':id/users')
  addMembers(
    @Param('id') id: string,
    @Body() membersDto: UpdateGroupMembersDto,
  ) {
    return this.groupsService.addUsers(id, membersDto.userIds);
  }

  @Delete(':id/users/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.groupsService.removeUser(id, userId);
  }
}
