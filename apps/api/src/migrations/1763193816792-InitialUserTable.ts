import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialUserTable1763193816792 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE TC_APP_ACCOUNT (
                id NVARCHAR(50) NOT NULL PRIMARY KEY,
                username NVARCHAR(50) NOT NULL UNIQUE,
                password NVARCHAR(100) NOT NULL,
                role NVARCHAR(20) NOT NULL DEFAULT 'user',
                full_name NVARCHAR(100) NOT NULL,
                dept_no NVARCHAR(20) NOT NULL,
                dept_name NVARCHAR(100) NOT NULL,
                is_active BIT NOT NULL DEFAULT 1,
                last_login_at DATETIME NULL,
                created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT CHK_TC_APP_ACCOUNT_role CHECK (role IN ('admin', 'manager', 'user'))
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE TC_APP_ACCOUNT;`);
  }
}
