USE LinkUpDatabase;
GO

-- DROP TABLE userTable;
-- GO

CREATE TABLE userTable(
    id INT IDENTITY(1, 1) PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(MAX) NOT NULL,
    avatar VARCHAR(MAX) NOT NULL,
    is_deleted BIT DEFAULT 0,
    is_verified BIT DEFAULT 0
);
GO