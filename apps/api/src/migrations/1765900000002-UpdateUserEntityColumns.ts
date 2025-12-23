import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserEntityColumns1765900000002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to TC_APP_ACCOUNT table
    await queryRunner.query(`
      ALTER TABLE TC_APP_ACCOUNT 
      ADD manager_id nvarchar(50) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_ACCOUNT 
      ADD sign_level int NOT NULL DEFAULT 1;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_ACCOUNT 
      ADD email nvarchar(100) NULL;
    `);

    // Update dept_no column length from 20 to 50
    await queryRunner.query(`
      ALTER TABLE TC_APP_ACCOUNT 
      ALTER COLUMN dept_no nvarchar(50) NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new columns
    await queryRunner.query(`
      ALTER TABLE TC_APP_ACCOUNT 
      DROP COLUMN manager_id;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_ACCOUNT 
      DROP COLUMN sign_level;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_ACCOUNT 
      DROP COLUMN email;
    `);

    // Revert dept_no column length back to 20
    await queryRunner.query(`
      ALTER TABLE TC_APP_ACCOUNT 
      ALTER COLUMN dept_no nvarchar(20) NULL;
    `);
  }
}
