const sql = require('mssql');

const config = {
  server: '60.248.245.253',
  port: 1433,
  user: 'sa',
  password: 'dsc',
  database: 'TC_DEV',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

async function createTable() {
  try {
    await sql.connect(config);
    const result = await sql.query(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'TC_APP_ACCOUNT')
      BEGIN
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
              updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
          );
          
          CREATE INDEX IDX_TC_APP_ACCOUNT_USERNAME ON TC_APP_ACCOUNT (username);
          CREATE INDEX IDX_TC_APP_ACCOUNT_IS_ACTIVE ON TC_APP_ACCOUNT (is_active);
          
          PRINT 'TC_APP_ACCOUNT table created successfully';
      END
      ELSE
      BEGIN
          PRINT 'TC_APP_ACCOUNT table already exists';
      END
    `);

    console.log('Table creation result:', result);
    console.log('TC_APP_ACCOUNT table created successfully!');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    await sql.close();
  }
}

createTable();
