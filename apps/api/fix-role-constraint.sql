-- Fix role check constraint to allow admin, manager, user roles
-- First drop existing constraint if it exists
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CHK_TC_APP_ACCOUNT_Role')
BEGIN
    ALTER TABLE TC_APP_ACCOUNT DROP CONSTRAINT CHK_TC_APP_ACCOUNT_Role;
    PRINT 'Dropped existing CHK_TC_APP_ACCOUNT_Role constraint';
END

-- Add new check constraint with proper role values
ALTER TABLE TC_APP_ACCOUNT 
ADD CONSTRAINT CHK_TC_APP_ACCOUNT_Role 
CHECK (role IN ('admin', 'manager', 'user'));

PRINT 'Added new CHK_TC_APP_ACCOUNT_Role constraint allowing admin, manager, user';