USE LinkUpDatabase;
GO

CREATE TABLE subCommentTable (
    id INT IDENTITY PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    content VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME,
    is_deleted BIT DEFAULT 0 NOT NULL,
    FOREIGN KEY (user_id) REFERENCES userTable(id),
    FOREIGN KEY (comment_id) REFERENCES commentTable(id)
);
GO
-- Create a trigger to enforce the maximum of two sub-comments per comment
CREATE TRIGGER LimitSubComments
ON subCommentTable
AFTER INSERT
AS
BEGIN
    DECLARE @CommentId INT;
    DECLARE @SubCommentCount INT;

    SELECT @CommentId = comment_id FROM inserted;

    SELECT @SubCommentCount = COUNT(*) FROM subCommentTable WHERE comment_id = @CommentId;

    IF @SubCommentCount > 2
    BEGIN
        THROW 50000, 'A comment cannot have more than two sub-comments.', 1;
        ROLLBACK;
    END
END;
GO