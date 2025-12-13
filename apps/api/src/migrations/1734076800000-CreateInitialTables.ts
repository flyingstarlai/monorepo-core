import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1734076800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE TC_APP_ACCOUNT (
        id nvarchar(50) NOT NULL,
        username nvarchar(50) NOT NULL,
        password nvarchar(100) NOT NULL,
        role nvarchar(20) NOT NULL DEFAULT 'user',
        full_name nvarchar(100) NOT NULL,
        dept_no nvarchar(20) NOT NULL,
        dept_name nvarchar(100) NOT NULL,
        is_active bit NOT NULL DEFAULT 1,
        last_login_at datetime NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_APP_ACCOUNT PRIMARY KEY (id),
        CONSTRAINT UQ_TC_APP_ACCOUNT_USERNAME UNIQUE (username)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE TC_APP_USER_GROUP (
        id nvarchar(50) NOT NULL,
        name nvarchar(100) NOT NULL,
        description nvarchar(255) NULL,
        is_active bit NOT NULL DEFAULT 1,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_APP_USER_GROUP PRIMARY KEY (id),
        CONSTRAINT UQ_9648cd50f154eaea9e5c46c6729 UNIQUE (name)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE TC_APP_USER_GROUP_MEMBERS (
        id nvarchar(50) NOT NULL,
        user_id nvarchar(50) NOT NULL,
        group_id nvarchar(50) NOT NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_APP_USER_GROUP_MEMBERS PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE TC_APP_DEFINITION (
        id nvarchar(50) NOT NULL,
        app_name nvarchar(100) NOT NULL,
        app_id nvarchar(100) NOT NULL,
        app_module nvarchar(50) NOT NULL,
        server_ip nvarchar(45) NOT NULL,
        created_by nvarchar(50) NOT NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_APP_DEFINITION PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE TC_APP_BUILD (
        id nvarchar(50) NOT NULL,
        app_definition_id nvarchar(50) NOT NULL,
        status nvarchar(20) NOT NULL,
        jenkins_queue_id int NULL,
        jenkins_build_number int NULL,
        artifact_path nvarchar(500) NULL,
        console_url nvarchar(500) NULL,
        error_message nvarchar(max) NULL,
        started_by nvarchar(50) NOT NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        started_at datetime NULL,
        completed_at datetime NULL,
        CONSTRAINT PK_TC_APP_BUILD PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE TC_APP_IDENTIFIERS (
        id nvarchar(50) NOT NULL,
        app_id nvarchar(100) NOT NULL,
        package_name nvarchar(200) NOT NULL,
        google_services_content nvarchar(max) NULL,
        created_by nvarchar(50) NOT NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_APP_IDENTIFIERS PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE TC_DASHBOARD_MODULE (
        no nvarchar(50) NOT NULL,
        label nvarchar(50) NOT NULL,
        app_title nvarchar(50) NOT NULL,
        query nvarchar(50) NOT NULL,
        CONSTRAINT PK_TC_DASHBOARD_MODULE PRIMARY KEY (no)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE TC_APP_USER (
        id nvarchar(50) NOT NULL,
        app_id nvarchar(50) NOT NULL DEFAULT 'tcsmart',
        app_name nvarchar(50) NOT NULL,
        app_version nvarchar(50) NOT NULL,
        token nvarchar(500) NOT NULL,
        name nvarchar(50) NOT NULL,
        company nvarchar(50) NOT NULL DEFAULT '',
        is_active bit NOT NULL DEFAULT 1,
        CONSTRAINT PK_TC_APP_USER PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE TC_ACCOUNT_LOGIN (
        _key uniqueidentifier NOT NULL,
        username nvarchar(50) NOT NULL,
        app_id nvarchar(50) NOT NULL,
        success bit NOT NULL DEFAULT 0,
        failure_reason nvarchar(200) NULL,
        login_at datetime NOT NULL,
        account_id nvarchar(50) NULL,
        app_name nvarchar(50) NULL,
        app_version nvarchar(50) NULL,
        app_module nvarchar(50) NULL,
        CONSTRAINT PK_TC_ACCOUNT_LOGIN PRIMARY KEY (_key)
      );
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_USER_GROUP_MEMBERS
        ADD CONSTRAINT UQ_USER_GROUP_MEMBERSHIP UNIQUE (user_id, group_id);
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_USER_GROUP_MEMBERS
        ADD CONSTRAINT FK_USER_GROUP_MEMBERS_USER
        FOREIGN KEY (user_id)
        REFERENCES TC_APP_ACCOUNT (id)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_USER_GROUP_MEMBERS
        ADD CONSTRAINT FK_USER_GROUP_MEMBERS_GROUP
        FOREIGN KEY (group_id)
        REFERENCES TC_APP_USER_GROUP (id)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD
        ADD CONSTRAINT FK_APP_BUILD_DEFINITION
        FOREIGN KEY (app_definition_id)
        REFERENCES TC_APP_DEFINITION (id)
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_USER_USERNAME ON TC_APP_ACCOUNT (username);
      CREATE INDEX IDX_USER_ROLE ON TC_APP_ACCOUNT (role);
      CREATE INDEX IDX_GROUP_NAME ON TC_APP_USER_GROUP (name);
      CREATE INDEX IDX_APP_DEFINITION_APP_ID ON TC_APP_DEFINITION (app_id);
      CREATE INDEX IDX_APP_BUILD_STATUS ON TC_APP_BUILD (status);
      CREATE INDEX IDX_APP_BUILD_DEFINITION_ID ON TC_APP_BUILD (app_definition_id);
      CREATE INDEX IDX_APP_IDENTIFIERS_APP_ID ON TC_APP_IDENTIFIERS (app_id);
      CREATE INDEX IDX_MOBILE_APP_APP_ID ON TC_APP_USER (app_id);
      CREATE INDEX IDX_LOGIN_HISTORY_USERNAME ON TC_ACCOUNT_LOGIN (username);
      CREATE INDEX IDX_LOGIN_HISTORY_APP_ID ON TC_ACCOUNT_LOGIN (app_id);
      CREATE INDEX IDX_LOGIN_HISTORY_LOGIN_AT ON TC_ACCOUNT_LOGIN (login_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS TC_ACCOUNT_LOGIN;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_USER;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_DASHBOARD_MODULE;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_IDENTIFIERS;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_BUILD;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_DEFINITION;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_USER_GROUP_MEMBERS;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_USER_GROUP;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_ACCOUNT;');
  }
}
