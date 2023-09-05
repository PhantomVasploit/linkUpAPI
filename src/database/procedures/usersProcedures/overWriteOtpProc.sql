USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE overWriteOtpProc(@email VARCHAR(255), @password VARCHAR(MAX)) 
AS
BEGIN
    UPDATE userTable SET password = @password, is_verified = 1 WHERE email = @email
END