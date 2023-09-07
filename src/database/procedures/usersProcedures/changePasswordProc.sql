USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE changePasswordProc(@email VARCHAR(255), @password VARCHAR(MAX))
AS
BEGIN
    UPDATE userTable SET password = @password, password_reset_token = NULL WHERE email = @email
END