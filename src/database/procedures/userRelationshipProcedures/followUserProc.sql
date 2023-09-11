USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE folloUserProc(@follower_id INT, @following_id INT)
AS
BEGIN
    INSERT INTO userRelationships(follower_id, following_id)
    VALUES(@follower_id, @following_id)
END