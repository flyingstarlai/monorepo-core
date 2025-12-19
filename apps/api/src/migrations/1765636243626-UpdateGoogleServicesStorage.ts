import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGoogleServicesStorage1765636243626
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove google_services_content column
    await queryRunner.query(`
            ALTER TABLE TC_APP_IDENTIFIERS DROP COLUMN google_services_content;
        `);

    // Add unique constraint to package_name
    await queryRunner.query(`
            ALTER TABLE TC_APP_IDENTIFIERS 
            ADD CONSTRAINT UQ_TC_APP_IDENTIFIERS_PACKAGE_NAME UNIQUE (package_name);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove unique constraint from package_name
    await queryRunner.query(`
            ALTER TABLE TC_APP_IDENTIFIERS 
            DROP CONSTRAINT UQ_TC_APP_IDENTIFIERS_PACKAGE_NAME;
        `);

    // Add back google_services_content column
    await queryRunner.query(`
            ALTER TABLE TC_APP_IDENTIFIERS 
            ADD google_services_content nvarchar(max) NULL;
        `);
  }
}
