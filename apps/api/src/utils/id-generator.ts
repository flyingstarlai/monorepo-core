import { nanoid } from 'nanoid';

export class IdGenerator {
  private static readonly DEFAULT_LENGTH = 12;

  static generateUserId(): string {
    return `user_${nanoid(this.DEFAULT_LENGTH)}`;
  }

  static generateCustomId(
    prefix: string,
    length: number = this.DEFAULT_LENGTH,
  ): string {
    return `${prefix}_${nanoid(length)}`;
  }
}
