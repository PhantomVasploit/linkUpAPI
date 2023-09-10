USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE createNewCommentProc(@post_id INT, @user_id INT, @content VARCHAR(500))
AS
BEGIN
    INSERT 
    INTO commentTable( post_id, user_id, content)
    VALUES (@post_id, @user_id, @content)
END