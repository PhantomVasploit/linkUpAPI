USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE unlikePostProc(@user_id INT, @post_id INT)
AS
BEGIN
    DELETE FROM postLikesTable WHERE user_id = @user_id AND post_id = @post_id
END