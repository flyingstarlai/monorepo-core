import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMobileAppBuilderTables1764127089869
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE TC_MOBILE_APP_DEFINITION (
                id NVARCHAR(50) NOT NULL PRIMARY KEY,
                app_name NVARCHAR(100) NOT NULL,
                app_id NVARCHAR(100) NOT NULL,
                app_module NVARCHAR(50) NOT NULL,
                server_ip NVARCHAR(45) NOT NULL,
                created_by NVARCHAR(50) NOT NULL,
                created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                CONSTRAINT CHK_TC_MOBILE_APP_DEFINITION_app_module CHECK (app_module IN (
                    SELECT no FROM TC_DASHBOARD_MODULE
                ))
            );
        `);

    await queryRunner.query(`
            CREATE TABLE TC_MOBILE_APP_BUILD (
                id NVARCHAR(50) NOT NULL PRIMARY KEY,
                app_definition_id NVARCHAR(50) NOT NULL,
                status NVARCHAR(20) NOT NULL DEFAULT 'queued',
                jenkins_queue_id INT NULL,
                jenkins_build_number INT NULL,
                artifact_path NVARCHAR(500) NULL,
                console_url NVARCHAR(500) NULL,
                error_message NVARCHAR(MAX) NULL,
                started_by NVARCHAR(50) NOT NULL,
                created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                started_at DATETIME NULL,
                completed_at DATETIME NULL,
                CONSTRAINT FK_TC_MOBILE_APP_BUILD_app_definition FOREIGN KEY (app_definition_id) 
                    REFERENCES TC_MOBILE_APP_DEFINITION(id) ON DELETE CASCADE,
                CONSTRAINT CHK_TC_MOBILE_APP_BUILD_status CHECK (status IN (
                    'queued', 'building', 'completed', 'failed', 'cancelled'
                ))
            );
        `);

    await queryRunner.query(`
            CREATE INDEX IDX_TC_MOBILE_APP_BUILD_app_definition_id 
                ON TC_MOBILE_APP_BUILD(app_definition_id);
        `);

    await queryRunner.query(`
            CREATE INDEX IDX_TC_MOBILE_APP_BUILD_status 
                ON TC_MOBILE_APP_BUILD(status);
        `);

    await queryRunner.query(`
            CREATE INDEX IDX_TC_MOBILE_APP_BUILD_created_at 
                ON TC_MOBILE_APP_BUILD(created_at DESC);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE TC_MOBILE_APP_BUILD;`);
    await queryRunner.query(`DROP TABLE TC_MOBILE_APP_DEFINITION;`);
  }
}
