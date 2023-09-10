USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE fetchCommentByIdProc(@id INT)
AS
BEGIN
     SELECT post_id, user_id, content, created_at, update_at, is_deleted
     FROM commentTable
     WHERE id = @id
END