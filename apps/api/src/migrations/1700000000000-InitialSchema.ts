import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACCOUNT]') AND type in (N'U'))
      CREATE TABLE [dbo].[ACCOUNT] (
        [id] nvarchar(50) NOT NULL,
        [username] nvarchar(50) NOT NULL,
        [password] nvarchar(100) NOT NULL,
        [full_name] nvarchar(100) NOT NULL,
        [role] nvarchar(20) NOT NULL DEFAULT 'user',
        [created_at] datetime2 NOT NULL DEFAULT GETDATE(),
        [updated_at] datetime2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_ACCOUNT] PRIMARY KEY CLUSTERED ([id] ASC)
      )
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'UQ_ACCOUNT_username' AND object_id = OBJECT_ID('[dbo].[ACCOUNT]'))
      CREATE UNIQUE INDEX [UQ_ACCOUNT_username] ON [dbo].[ACCOUNT] ([username])
    `);

    await queryRunner.query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ACCOUNT_LOGIN]') AND type in (N'U'))
      CREATE TABLE [dbo].[ACCOUNT_LOGIN] (
        [id] uniqueidentifier NOT NULL DEFAULT NEWID(),
        [account_id] nvarchar(50) NULL,
        [login_at] datetime NOT NULL,
        CONSTRAINT [PK_ACCOUNT_LOGIN] PRIMARY KEY CLUSTERED ([id] ASC)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS [UQ_ACCOUNT_username] ON [dbo].[ACCOUNT]`,
    );
    await queryRunner.query(
      `IF OBJECT_ID(N'[dbo].[ACCOUNT]', N'U') IS NOT NULL DROP TABLE [dbo].[ACCOUNT]`,
    );
    await queryRunner.query(
      `IF OBJECT_ID(N'[dbo].[ACCOUNT_LOGIN]', N'U') IS NOT NULL DROP TABLE [dbo].[ACCOUNT_LOGIN]`,
    );
  }
}
