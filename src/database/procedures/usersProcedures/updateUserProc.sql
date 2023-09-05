USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE updateUserProc(@id INT, @first_name VARCHAR(255), @last_name VARCHAR(255), @email VARCHAR(255), @avatar VARCHAR(MAX))
AS
BEGIN
    UPDATE userTable
    SET first_name = @first_name, last_name = @last_name, email = @email, avatar = @avatar
    WHERE id = @id
END