USE LinkUpDatabase;
GO


CREATE OR ALTER PROCEDURE updatePostProc(@id INT, @image VARCHAR(MAX), @content VARCHAR(500))
AS
BEGIN
    UPDATE postTable 
    SET image = @image, content = @content, update_at = CURRENT_TIMESTAMP
    WHERE id = @id
END