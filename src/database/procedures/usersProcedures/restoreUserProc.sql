USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE restoreUserProc(@email VARCHAR(255))
AS
BEGIN
    UPDATE userTable
    SET is_deleted = 0
    WHERE email = @email
END