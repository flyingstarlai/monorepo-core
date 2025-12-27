import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateDocumentAccessLevels1767000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE TC_APP_DOCS
      SET document_access_level = 
        CASE 
          WHEN document_access_level = 0 THEN 1
          WHEN document_access_level = 1 THEN 2
          WHEN document_access_level = 2 THEN 3
          ELSE document_access_level
        END
      WHERE document_access_level IN (0, 1, 2);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE TC_APP_DOCS
      SET document_access_level = 
        CASE 
          WHEN document_access_level = 1 THEN 0
          WHEN document_access_level = 2 THEN 1
          WHEN document_access_level = 3 THEN 2
          ELSE document_access_level
        END
      WHERE document_access_level IN (1, 2, 3);
    `);
  }
}
