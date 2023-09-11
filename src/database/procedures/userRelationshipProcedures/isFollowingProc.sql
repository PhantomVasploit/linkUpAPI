USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE isFollowing(@follower_id INT, @following_id INT)
AS
BEGIN
    SELECT id, follower_id, following_id
    FROM userRelationships
    WHERE follower_id = @follower_id AND following_id = @following_id
END