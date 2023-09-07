USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE findUserByEmailProc(@email VARCHAR(255))
AS
BEGIN
    SELECT id, first_name, last_name, password, avatar, password_reset_token
    FROM userTable
    WHERE email = @email
END