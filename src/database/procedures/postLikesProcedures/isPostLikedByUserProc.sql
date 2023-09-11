USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE isPostLikedByUserProc(@user_id INT, @post_id INT)
AS
BEGIN
    SELECT id, user_id, post_id FROM postLikesTable WHERE user_id = @user_id AND post_id = @post_id;
END