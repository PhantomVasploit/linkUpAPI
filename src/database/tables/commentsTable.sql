USE LinkUpDatabase;
GO

-- DROP TABLE commentTable
-- GO

CREATE TABLE commentTable(
    id INT IDENTITY PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_at DATETIME,
    is_deleted BIT DEFAULT 0 NOT NULL
    FOREIGN KEY (user_id) REFERENCES userTable(id),
    FOREIGN KEY (post_id )REFERENCES postTable(id)
)