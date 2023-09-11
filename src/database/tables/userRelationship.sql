USE LinkUpDatabase;
GO

-- DROP TABLE userRelationships
-- GO

CREATE TABLE userRelationships(
    id INT IDENTITY(1, 1) PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    FOREIGN KEY (follower_id) REFERENCES userTable(id),
    FOREIGN KEY (following_id) REFERENCES userTable(id)
)
GO