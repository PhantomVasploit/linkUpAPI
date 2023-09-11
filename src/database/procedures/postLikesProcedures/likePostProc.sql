USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE likePostProc(@user_id INT, @post_id INT)
AS
BEGIN
    INSERT INTO postLikesTable(user_id, post_id)
    VALUES(@user_id, @post_id)
END