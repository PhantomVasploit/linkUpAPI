USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE findAllUsersProc
AS
BEGIN
    SELECT id, first_name, last_name, email, avatar
    FROM userTable
END