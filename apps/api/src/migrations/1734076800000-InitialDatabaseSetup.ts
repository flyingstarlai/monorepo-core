import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialDatabaseSetup1734076800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create TC_APP_ACCOUNT table
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

    // Create TC_APP_USER_GROUP table
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

    // Create TC_APP_USER_GROUP_MEMBERS table
    await queryRunner.query(`
      CREATE TABLE TC_APP_USER_GROUP_MEMBERS (
        id nvarchar(50) NOT NULL,
        user_id nvarchar(50) NOT NULL,
        group_id nvarchar(50) NOT NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_APP_USER_GROUP_MEMBERS PRIMARY KEY (id)
      );
    `);

    // Create TC_APP_DEFINITION table with company_code field
    await queryRunner.query(`
      CREATE TABLE TC_APP_DEFINITION (
        id nvarchar(50) NOT NULL,
        app_name nvarchar(100) NOT NULL,
        app_id nvarchar(100) NOT NULL,
        app_module nvarchar(50) NOT NULL,
        server_ip nvarchar(45) NOT NULL,
        company_code nvarchar(50) NULL,
        created_by nvarchar(50) NOT NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_APP_DEFINITION PRIMARY KEY (id)
      );
    `);

    // Create TC_APP_BUILD table with all enhanced fields
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
        build_parameters text NULL,
        error_details nvarchar(1000) NULL,
        error_category nvarchar(100) NULL,
        duration_ms int NULL,
        memory_usage_mb int NULL,
        cpu_usage_percent int NULL,
        build_stage nvarchar(50) NULL,
        stage_progress_percent int NULL,
        performance_metrics text NULL,
        environment nvarchar(100) NULL,
        branch_name nvarchar(100) NULL,
        commit_hash nvarchar(100) NULL,
        build_type nvarchar(20) NULL,
        is_automated bit NOT NULL DEFAULT 0,
        trigger_source nvarchar(500) NULL,
        build_logs_summary text NULL,
        test_results nvarchar(max) NULL,
        quality_metrics nvarchar(max) NULL,
        stages_snapshot nvarchar(max) NULL,
        stage_snapshot_fetched_at datetime NULL,
        CONSTRAINT PK_TC_APP_BUILD PRIMARY KEY (id)
      );
    `);

    // Create TC_APP_IDENTIFIERS table without google_services_content
    await queryRunner.query(`
      CREATE TABLE TC_APP_IDENTIFIERS (
        id nvarchar(50) NOT NULL,
        app_id nvarchar(100) NOT NULL,
        package_name nvarchar(200) NOT NULL,
        created_by nvarchar(50) NOT NULL,
        created_at datetime2 NOT NULL DEFAULT GETDATE(),
        updated_at datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_TC_APP_IDENTIFIERS PRIMARY KEY (id)
      );
    `);

    // Create TC_DASHBOARD_MODULE table
    await queryRunner.query(`
      CREATE TABLE TC_DASHBOARD_MODULE (
        no nvarchar(50) NOT NULL,
        label nvarchar(50) NOT NULL,
        app_title nvarchar(50) NOT NULL,
        query nvarchar(50) NOT NULL,
        CONSTRAINT PK_TC_DASHBOARD_MODULE PRIMARY KEY (no)
      );
    `);

    // Create TC_APP_USER table
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

    // Create TC_ACCOUNT_LOGIN table
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

    // Create TC_APP_COMPANY table with company_code
    await queryRunner.query(`
      CREATE TABLE TC_APP_COMPANY (
        company_code nvarchar(50) NOT NULL,
        company_name nvarchar(100) NOT NULL,
        is_active bit NOT NULL DEFAULT 1,
        created_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_TC_APP_COMPANY PRIMARY KEY (company_code)
      );
    `);

    // Create TC_APP_DEPT table
    await queryRunner.query(`
      CREATE TABLE TC_APP_DEPT (
        dept_no nvarchar(50) NOT NULL,
        dept_name nvarchar(100) NOT NULL,
        parent_dept_no nvarchar(50) NULL,
        dept_level int NOT NULL,
        manager_id nvarchar(50) NULL,
        is_active bit NOT NULL DEFAULT 1,
        sort_no int NOT NULL DEFAULT 0,
        created_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT PK_TC_APP_DEPT PRIMARY KEY (dept_no)
      );
    `);

    // Create TC_APP_DOCS table
    await queryRunner.query(`
      CREATE TABLE TC_APP_DOCS (
        id nvarchar(20) NOT NULL,
        document_kind nvarchar(20) NULL,
        document_number nvarchar(20) NOT NULL,
        document_name nvarchar(50) NULL,
        office_file_path nvarchar(255) NULL,
        pdf_file_path nvarchar(255) NULL,
        document_access_level int NULL DEFAULT 1,
        stage_id nvarchar(20) NULL,
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

    // Create TC_APP_DOC_STAGES table
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

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE TC_APP_USER_GROUP_MEMBERS
        ADD CONSTRAINT FK_USER_GROUP_MEMBERSHIP UNIQUE (user_id, group_id);
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
      ALTER TABLE TC_APP_DEFINITION
        ADD CONSTRAINT FK_APP_DEFINITION_COMPANY
        FOREIGN KEY (company_code)
        REFERENCES TC_APP_COMPANY (company_code);
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_DOCS
        ADD CONSTRAINT FK_DOCS_STAGE
        FOREIGN KEY (stage_id)
        REFERENCES TC_APP_DOC_STAGES (id)
        ON DELETE SET NULL;
    `);

    // Add unique constraint to TC_APP_IDENTIFIERS
    await queryRunner.query(`
      ALTER TABLE TC_APP_IDENTIFIERS
      ADD CONSTRAINT UQ_TC_APP_IDENTIFIERS_PACKAGE_NAME UNIQUE (package_name);
    `);

    // Insert initial document stages data
    await queryRunner.query(`
      INSERT INTO TC_APP_DOC_STAGES (id, title, sort_order)
      VALUES
        ('STG001', '第一階', 1),
        ('STG002', '第二階', 2),
        ('STG003', '第三階', 3),
        ('STG004', '第四階', 4);
    `);

    // Set default stage_id for existing documents
    await queryRunner.query(`
      UPDATE TC_APP_DOCS
      SET stage_id = 'STG001'
      WHERE stage_id IS NULL;
    `);

    // Insert initial company data
    await queryRunner.query(`
      INSERT INTO TC_APP_COMPANY (company_code, company_name, is_active)
      VALUES ('TWSBP', 'TWSBP', 1);
    `);

    // Update TC_APP_DOCS document access levels (0→1, 1→2, 2→3, 3→2)
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

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IDX_USER_USERNAME ON TC_APP_ACCOUNT (username);
      CREATE INDEX IDX_USER_ROLE ON TC_APP_ACCOUNT (role);
      CREATE INDEX IDX_GROUP_NAME ON TC_APP_USER_GROUP (name);
      CREATE INDEX IDX_APP_DEFINITION_APP_ID ON TC_APP_DEFINITION (app_id);
      CREATE INDEX IDX_APP_DEFINITION_COMPANY_CODE ON TC_APP_DEFINITION (company_code);
      CREATE INDEX IDX_APP_BUILD_STATUS ON TC_APP_BUILD (status);
      CREATE INDEX IDX_APP_BUILD_DEFINITION_ID ON TC_APP_BUILD (app_definition_id);
      CREATE INDEX IDX_APP_IDENTIFIERS_APP_ID ON TC_APP_IDENTIFIERS (app_id);
      CREATE INDEX IDX_MOBILE_APP_APP_ID ON TC_APP_USER (app_id);
      CREATE INDEX IDX_LOGIN_HISTORY_USERNAME ON TC_ACCOUNT_LOGIN (username);
      CREATE INDEX IDX_LOGIN_HISTORY_APP_ID ON TC_ACCOUNT_LOGIN (app_id);
      CREATE INDEX IDX_LOGIN_HISTORY_LOGIN_AT ON TC_ACCOUNT_LOGIN (login_at);
      CREATE INDEX IDX_DEPT_PARENT_DEPT ON TC_APP_DEPT (parent_dept_no);
      CREATE INDEX IDX_DEPT_MANAGER_ID ON TC_APP_DEPT (manager_id);
      CREATE INDEX IDX_DEPT_IS_ACTIVE ON TC_APP_DEPT (is_active);
      CREATE INDEX IDX_DEPT_SORT_NO ON TC_APP_DEPT (sort_no);
      CREATE INDEX IDX_DOCS_DOCUMENT_KIND ON TC_APP_DOCS (document_kind);
      CREATE INDEX IDX_DOCS_CREATED_BY ON TC_APP_DOCS (created_by);
      CREATE INDEX IDX_DOCS_DOWNLOADED_BY ON TC_APP_DOCS (downloaded_by);
      CREATE INDEX IDX_DOCS_CREATED_AT ON TC_APP_DOCS (created_at);
      CREATE INDEX IDX_DOCS_STAGE_ID ON TC_APP_DOCS (stage_id);
      CREATE INDEX IDX_DOC_STAGES_SORT_ORDER ON TC_APP_DOC_STAGES (sort_order);
      CREATE INDEX IDX_COMPANY_IS_ACTIVE ON TC_APP_COMPANY (is_active);
      CREATE INDEX IDX_COMPANY_CREATED_AT ON TC_APP_COMPANY (created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order of dependencies
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_USER_GROUP_MEMBERS;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_USER_GROUP;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_DEPT;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_COMPANY;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_DOCS;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_DOC_STAGES;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_BUILD;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_DEFINITION;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_IDENTIFIERS;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_DASHBOARD_MODULE;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_USER;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_ACCOUNT_LOGIN;');
    await queryRunner.query('DROP TABLE IF EXISTS TC_APP_ACCOUNT;');
  }
}
