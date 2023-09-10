USE LinkUpDatabase;
GO

CREATE OR ALTER PROCEDURE fetchAllPostCommentsAndTheirAuthorProc(@post_id INT)
AS
BEGIN
    SELECT
        c.id AS comment_id,
        c.content AS comment_content,
        c.created_at AS comment_created_at,
        u.id AS user_id,
        u.first_name AS user_first_name,
        u.last_name AS user_last_name,
        u.email AS user_email,
        u.avatar AS user_avatar
    FROM
        commentTable AS c
    INNER JOIN
        userTable AS u ON c.user_id = u.id
    WHERE
        c.post_id = @post_id
        AND c.is_deleted = 0
    ORDER BY
        c.created_at ASC; 

END