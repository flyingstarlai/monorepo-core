import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentKindsTable1765900000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create document kinds table
    await queryRunner.query(`
      CREATE TABLE TC_DOC_KINDS (
        id int IDENTITY(1,1) NOT NULL,
        code nvarchar(20) NOT NULL,
        name nvarchar(50) NOT NULL,
        description nvarchar(200) NULL,
        is_active bit NOT NULL DEFAULT 1,
        display_order int NOT NULL DEFAULT 0,
        created_by nvarchar(20) NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        modified_by nvarchar(20) NULL,
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_DOC_KINDS PRIMARY KEY (id),
        CONSTRAINT UC_TC_DOC_KINDS_CODE UNIQUE (code)
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IDX_TC_DOC_KINDS_CODE ON TC_DOC_KINDS (code);
      CREATE INDEX IDX_TC_DOC_KINDS_IS_ACTIVE ON TC_DOC_KINDS (is_active);
      CREATE INDEX IDX_TC_DOC_KINDS_DISPLAY_ORDER ON TC_DOC_KINDS (display_order);
    `);

    // Insert default document kinds
    await queryRunner.query(`
      INSERT INTO TC_DOC_KINDS (code, name, description, display_order, is_active) VALUES
      ('PROCEDURE', 'Procedure', 'Standard operating procedures and work instructions', 1, 1),
      ('FORM', 'Form', 'Official forms and templates', 2, 1),
      ('POLICY', 'Policy', 'Company policies and regulations', 3, 1),
      ('MANUAL', 'Manual', 'User manuals and guides', 4, 1),
      ('OTHER', 'Other', 'Other document types not covered by standard categories', 5, 1);
    `);

    // Add foreign key column to documents table
    await queryRunner.query(`
      ALTER TABLE TC_APP_DOCS 
      ADD document_kind_id int NULL;
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE TC_APP_DOCS 
      ADD CONSTRAINT FK_TC_APP_DOCS_DOCUMENT_KIND 
      FOREIGN KEY (document_kind_id) REFERENCES TC_DOC_KINDS(id);
    `);

    // Create index for the new foreign key
    await queryRunner.query(`
      CREATE INDEX IDX_TC_APP_DOCS_DOCUMENT_KIND_ID ON TC_APP_DOCS (document_kind_id);
    `);

    // Create trigger to populate document_kind_id from document_kind for existing records
    await queryRunner.query(`
      CREATE TRIGGER TR_TC_APP_DOCS_UPDATE_KIND_ID
      ON TC_APP_DOCS
      AFTER INSERT, UPDATE
      AS
      BEGIN
        DECLARE @doc_kind_value nvarchar(20)
        DECLARE @inserted_id int
        
        SELECT @inserted_id = id, @doc_kind_value = document_kind 
        FROM INSERTED 
        WHERE document_kind_id IS NULL AND document_kind IS NOT NULL
        
        IF @doc_kind_value IS NOT NULL
          AND EXISTS (SELECT 1 FROM TC_DOC_KINDS WHERE code = @doc_kind_value)
        BEGIN
          UPDATE TC_APP_DOCS
          SET document_kind_id = (
            SELECT id FROM TC_DOC_KINDS WHERE code = @doc_kind_value
          )
          WHERE id = @inserted_id
        END
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS TR_TC_APP_DOCS_UPDATE_KIND_ID;',
    );

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE TC_APP_DOCS 
      DROP CONSTRAINT FK_TC_APP_DOCS_DOCUMENT_KIND;
    `);

    // Drop new column
    await queryRunner.query(`
      ALTER TABLE TC_APP_DOCS 
      DROP COLUMN document_kind_id;
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_TC_APP_DOCS_DOCUMENT_KIND_ID;
      DROP INDEX IF EXISTS IDX_TC_DOC_KINDS_DISPLAY_ORDER;
      DROP INDEX IF EXISTS IDX_TC_DOC_KINDS_IS_ACTIVE;
      DROP INDEX IF EXISTS IDX_TC_DOC_KINDS_CODE;
    `);

    // Drop table
    await queryRunner.query('DROP TABLE IF EXISTS TC_DOC_KINDS;');
  }
}
