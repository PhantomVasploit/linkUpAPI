USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE createNewUserProcedure(@first_name VARCHAR(255), @last_name VARCHAR(255), @email VARCHAR(255), @password VARCHAR(MAX), @avatar VARCHAR(MAX))
AS
BEGIN
    INSERT INTO userTable(first_name, last_name, email, password, avatar)
    VALUES(@first_name, @last_name, @email, @password, @avatar);
END