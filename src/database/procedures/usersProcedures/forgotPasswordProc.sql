USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE forgotPasswordProc(@email VARCHAR(255), @reset_password_token VARCHAR(255))
AS
BEGIN
    UPDATE userTable 
    SET password_reset_token = @reset_password_token
    WHERE email = @email
END