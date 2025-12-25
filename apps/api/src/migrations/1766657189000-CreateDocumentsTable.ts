import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentsTable1766657189000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE TC_APP_DOCS (
        id nvarchar(20) NOT NULL,
        document_kind nvarchar(20) NULL,
        document_number nvarchar(20) NOT NULL,
        document_name nvarchar(50) NULL,
        office_file_path nvarchar(255) NULL,
        pdf_file_path nvarchar(255) NULL,
        document_access_level int NULL DEFAULT 1,
        version nvarchar(10) NULL,
        created_by nvarchar(50) NULL,
        created_at_user nvarchar(50) NULL,
        modified_by nvarchar(50) NULL,
        modified_at_user nvarchar(50) NULL,
        downloaded_by nvarchar(50) NULL,
        downloaded_at_user nvarchar(50) NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_APP_DOCS PRIMARY KEY (id),
        CONSTRAINT UQ_TC_APP_DOCS_DOCUMENT_NUMBER UNIQUE (document_number)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_DOCS_DOCUMENT_KIND ON TC_APP_DOCS (document_kind);
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_DOCS_CREATED_BY ON TC_APP_DOCS (created_by);
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_DOCS_DOWNLOADED_BY ON TC_APP_DOCS (downloaded_by);
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_DOCS_CREATED_AT ON TC_APP_DOCS (created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_DOCS;');
  }
}
