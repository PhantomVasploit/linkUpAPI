USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE getAllPostsProc
AS
BEGIN
    SELECT id, user_id, image, content, created_at, update_at, is_deleted
    FROM postTable
END