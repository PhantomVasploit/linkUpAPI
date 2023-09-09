USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE createNewPostsProc(@user_id INT, @image VARCHAR(MAX), @content VARCHAR(500))
AS
BEGIN
    INSERT 
    INTO postTable(user_id, image, content) 
    VALUES (@user_id, @image, @content)
END
GO