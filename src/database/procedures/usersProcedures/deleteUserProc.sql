USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE deleteUserProc(@id INT)
AS
BEGIN
    UPDATE userTable
    SET is_deleted = 1
    WHERE id = @id
END
GO