USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE deletePostProc(@id INT)
AS
BEGIN
    UPDATE postTable
    SET is_deleted = 1
    WHERE id = @id
END