import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentStages1768000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE TC_APP_DOC_STAGES (
        id nvarchar(20) NOT NULL,
        title nvarchar(100) NOT NULL,
        sort_order int NOT NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_APP_DOC_STAGES PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_DOC_STAGES_SORT_ORDER ON TC_APP_DOC_STAGES (sort_order);
    `);

    await queryRunner.query(`
      INSERT INTO TC_APP_DOC_STAGES (id, title, sort_order)
      VALUES
        ('STG001', '第一階', 1),
        ('STG002', '第二階', 2),
        ('STG003', '第三階', 3),
        ('STG004', '第四階', 4);
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_DOCS
      ADD stage_id nvarchar(20) NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_DOCS_STAGE_ID ON TC_APP_DOCS (stage_id);
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_DOCS
      ADD CONSTRAINT FK_DOCS_STAGE
      FOREIGN KEY (stage_id)
      REFERENCES TC_APP_DOC_STAGES (id)
      ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      UPDATE TC_APP_DOCS
      SET stage_id = 'STG001'
      WHERE stage_id IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_DOC_STAGES;');
  }
}
