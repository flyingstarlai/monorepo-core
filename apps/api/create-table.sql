-- Create TC_APP_ACCOUNT table if it doesn't exist
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
    
    -- Create indexes
    CREATE INDEX IDX_TC_APP_ACCOUNT_USERNAME ON TC_APP_ACCOUNT (username);
    CREATE INDEX IDX_TC_APP_ACCOUNT_IS_ACTIVE ON TC_APP_ACCOUNT (is_active);
    
    PRINT 'TC_APP_ACCOUNT table created successfully';
END
ELSE
BEGIN
    PRINT 'TC_APP_ACCOUNT table already exists';
END