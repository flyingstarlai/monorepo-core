import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnhancedBuildHistoryFields1765867530000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add enhanced build history fields to TC_APP_BUILD table
    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD build_parameters text NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD error_details nvarchar(1000) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD error_category nvarchar(100) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD duration_ms int NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD memory_usage_mb int NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD cpu_usage_percent int NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD build_stage nvarchar(50) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD stage_progress_percent int NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD performance_metrics text NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD environment nvarchar(100) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD branch_name nvarchar(100) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD commit_hash nvarchar(100) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD build_type nvarchar(20) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD is_automated bit NOT NULL DEFAULT 0;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD trigger_source nvarchar(500) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD build_logs_summary text NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD test_results nvarchar(max) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD quality_metrics nvarchar(max) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD stages_snapshot nvarchar(max) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      ADD stage_snapshot_fetched_at datetime NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all added columns for rollback
    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN build_parameters;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN error_details;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN error_category;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN duration_ms;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN memory_usage_mb;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN cpu_usage_percent;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN build_stage;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN stage_progress_percent;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN performance_metrics;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN environment;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN branch_name;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN commit_hash;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN build_type;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN is_automated;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN trigger_source;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN build_logs_summary;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN test_results;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN quality_metrics;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN stages_snapshot;
    `);

    await queryRunner.query(`
      ALTER TABLE TC_APP_BUILD 
      DROP COLUMN stage_snapshot_fetched_at;
    `);
  }
}
