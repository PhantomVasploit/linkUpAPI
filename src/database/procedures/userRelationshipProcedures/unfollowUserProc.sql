USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE unfollowUserProc(@follower_id INT, @following_id INT)
AS
BEGIN
    DELETE FROM userRelationships
    WHERE follower_id = @follower_id AND following_id = @following_id
END