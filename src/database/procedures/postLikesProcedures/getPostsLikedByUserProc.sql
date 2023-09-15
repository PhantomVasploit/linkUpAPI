USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE getPostsLikedByUserProc(@user_id INT)
AS
BEGIN
    SELECT
        P.id AS post_id,
        U1.first_name AS user_first_name,
        U1.last_name AS user_last_name,
        U1.email AS user_email,
        U1.id AS user_id,
        U1.avatar AS user_avatar,
        P.image AS post_image,
        P.content AS post_content,
        P.created_at AS post_created_at
    FROM
        postLikesTable PL
    JOIN
        userTable U ON PL.user_id = U.id
    JOIN
        postTable P ON PL.post_id = P.id
    JOIN
        userTable U1 ON P.user_id = U1.id
    WHERE
        U.id = @user_id;
END