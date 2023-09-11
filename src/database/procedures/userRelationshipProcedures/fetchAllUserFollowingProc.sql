USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE fetchAllUserFollowingProc(@follower_id INT)
AS
BEGIN
    SELECT u2.id AS following_id, u2.first_name AS following_first_name, u2.last_name AS following_last_name
    FROM userRelationships AS ur
    JOIN userTable AS u2 ON ur.following_id = u2.id
    WHERE ur.follower_id = @follower_id
END