USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE getPostByIdProc(@id INT)
AS
BEGIN
    SELECT id, user_id, image, content, created_at, update_at, is_deleted
    FROM postTable
    WHERE id = @id
END