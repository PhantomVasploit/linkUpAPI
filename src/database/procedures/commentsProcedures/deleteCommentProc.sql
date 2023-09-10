USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE deleteCommentProc(@id INT)
AS
BEGIN
    UPDATE commentTable
    SET is_deleted = 1
    WHERE id = @id
END