USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE getPostsLikedByUserProc(@user_id INT)
AS
BEGIN
    SELECT postTable.id, postTable.user_id, postTable.image, postTable.content, postTable.created_at, postTable.update_at, postTable.is_deleted
    FROM postLikesTable
    JOIN postTable ON postLikesTable.post_id = postTable.id
    WHERE postLikesTable.user_id = @user_id;
END