import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDepartmentsTable1767355218000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE TC_APP_DEPT (
        dept_no nvarchar(50) NOT NULL,
        dept_name nvarchar(100) NOT NULL,
        parent_dept_no nvarchar(50),
        dept_level int NOT NULL,
        manager_id nvarchar(50),
        is_active bit NOT NULL DEFAULT 1,
        sort_no int NOT NULL DEFAULT 0,
        created_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_TC_APP_DEPT PRIMARY KEY (dept_no)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_DEPT_PARENT_DEPT ON TC_APP_DEPT (parent_dept_no);
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_DEPT_MANAGER_ID ON TC_APP_DEPT (manager_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_DEPT_IS_ACTIVE ON TC_APP_DEPT (is_active);
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_DEPT_SORT_NO ON TC_APP_DEPT (sort_no);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_DEPT;');
  }
}
