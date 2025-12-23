import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentsTable1765900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE TC_APP_DOCS (
        id int IDENTITY(1,1) NOT NULL,
        document_kind nvarchar(10) NULL,
        document_number nvarchar(20) NULL,
        document_name nvarchar(50) NULL,
        office_file_path nvarchar(100) NULL,
        pdf_file_path nvarchar(100) NULL,
        version nvarchar(10) NULL,
        created_by nvarchar(20) NULL,
        created_at_user nvarchar(20) NULL,
        modified_by nvarchar(20) NULL,
        modified_at_user nvarchar(20) NULL,
        downloaded_by nvarchar(20) NULL,
        downloaded_at_user nvarchar(20) NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_APP_DOCS PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_TC_APP_DOCS_DOCUMENT_KIND ON TC_APP_DOCS (document_kind);
      CREATE INDEX IDX_TC_APP_DOCS_DOCUMENT_NUMBER ON TC_APP_DOCS (document_number);
      CREATE INDEX IDX_TC_APP_DOCS_DOCUMENT_NAME ON TC_APP_DOCS (document_name);
      CREATE INDEX IDX_TC_APP_DOCS_CREATED_BY ON TC_APP_DOCS (created_by);
      CREATE INDEX IDX_TC_APP_DOCS_CREATED_AT ON TC_APP_DOCS (created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_DOCS;');
  }
}
