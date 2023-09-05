USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE findUserByIdProc(@id INT)
AS
BEGIN
    SELECT first_name, last_name, email, avatar
    FROM userTable
    WHERE id = @id
END