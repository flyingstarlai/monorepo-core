import { ArrayNotEmpty, ArrayUnique, IsArray, IsString } from 'class-validator';

export class UpdateGroupMembersDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  userIds: string[];
}
