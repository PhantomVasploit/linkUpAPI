USE LinkUpDatabase;
GO

-- DROP TABLE postTable
-- GO

CREATE TABLE postTable(
    id INT IDENTITY(1, 1) PRIMARY KEY,
    user_id INT NOT NULL,
    image VARCHAR(MAX),
    content VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_at DATETIME,
    is_deleted BIT DEFAULT 0 NOT NULL,
    FOREIGN KEY (user_id) REFERENCES userTable(id)
)
GO