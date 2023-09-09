USE LinkUpDatabase;
GO

-- DROP TABLE postLikesTable
-- GO

CREATE TABLE postLikesTable(
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES userTable(id),
    FOREIGN KEY (post_id) REFERENCES postTable(id)
)