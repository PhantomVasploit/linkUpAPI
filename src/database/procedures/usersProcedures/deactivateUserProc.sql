USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE deactivateUserProc(@email VARCHAR(255))
AS
BEGIN
    UPDATE userTable
    SET is_deleted = 1
    WHERE email = @email
END