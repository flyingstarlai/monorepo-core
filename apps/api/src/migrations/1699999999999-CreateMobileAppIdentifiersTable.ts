import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMobileAppIdentifiersTable1699999999999
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'TC_MOBILE_APP_IDENTIFIERS',
        columns: [
          {
            name: 'id',
            type: 'nvarchar',
            length: '50',
            isPrimary: true,
          },
          {
            name: 'app_id',
            type: 'nvarchar',
            length: '100',
          },
          {
            name: 'package_name',
            type: 'nvarchar',
            length: '200',
          },
          {
            name: 'created_by',
            type: 'nvarchar',
            length: '50',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'GETDATE()',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'GETDATE()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('TC_MOBILE_APP_IDENTIFIERS');
  }
}
