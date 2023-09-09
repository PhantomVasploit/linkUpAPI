USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE getUserPostsProc(@user_id INT)
AS
BEGIN
    SELECT id, image, content, created_at, update_at, is_deleted
    FROM postTable
    WHERE user_id = @user_id
END