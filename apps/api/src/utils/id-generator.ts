import { nanoid } from 'nanoid';

export class IdGenerator {
  private static readonly DEFAULT_LENGTH = 12;

  static generateUserId(): string {
    return `user_${nanoid(this.DEFAULT_LENGTH)}`;
  }

  static generateGroupId(): string {
    return `group_${nanoid(this.DEFAULT_LENGTH)}`;
  }

  static generateMembershipId(): string {
    return `membership_${nanoid(this.DEFAULT_LENGTH)}`;
  }

  static generateDefinitionId(): string {
    return `def_${nanoid(this.DEFAULT_LENGTH)}`;
  }

  static generateBuildId(): string {
    return `build_${nanoid(this.DEFAULT_LENGTH)}`;
  }

  static generateIdentifierId(): string {
    return `id_${nanoid(this.DEFAULT_LENGTH)}`;
  }

  static generateDocumentId(): string {
    return `doc_${nanoid(this.DEFAULT_LENGTH)}`;
  }

  static generateDocumentStageId(): string {
    return `stage_${nanoid(this.DEFAULT_LENGTH)}`;
  }

  static generateCustomId(
    prefix: string,
    length: number = this.DEFAULT_LENGTH,
  ): string {
    return `${prefix}_${nanoid(length)}`;
  }
}
