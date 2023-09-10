USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE getUserPostsProc(@user_id INT)
AS
BEGIN
    SELECT 
        p.id AS post_id,
        p.content AS post_content,
        p.image AS post_image,
        p.created_at AS post_created_at,
        u.id AS user_id,
        u.first_name AS user_first_name,
        u.last_name AS user_last_name,
        u.email AS user_email,
        u.avatar AS user_avatar,
        COUNT(DISTINCT c.id) AS comment_count,
        COUNT(DISTINCT pl.id) AS like_count
    FROM 
        postTable AS p
    INNER JOIN 
        userTable AS u ON p.user_id = u.id
    LEFT JOIN 
        commentTable AS c ON p.id = c.post_id
    LEFT JOIN 
        postLikesTable AS pl ON p.id = pl.post_id
    WHERE 
        p.is_deleted = 0
        AND
        u.id = @user_id
    GROUP BY 
        p.id, p.content, p.image, p.created_at, u.id, u.first_name, u.last_name, u.email, u.avatar
    ORDER BY 
        p.created_at DESC;
END