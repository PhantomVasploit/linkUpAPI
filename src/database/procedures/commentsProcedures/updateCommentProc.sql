USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE updateCommentProc(@id INT, @content VARCHAR(500))
AS
BEGIN
    UPDATE commentTable
    SET content = @content
    WHERE id = @id
END