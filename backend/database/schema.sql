CREATE TABLE IF NOT EXISTS students (
    name VARCHAR(255) NOT NULL,
    id CHAR(9) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    batch INT NOT NULL,
    session CHAR(7) NOT NULL,
    roll INT NOT NULL,
    exam_roll INT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS cr(
    id CHAR(9) NOT NULL UNIQUE,
    batch INT NOT NULL,
    PRIMARY KEY(batch),
    FOREIGN KEY(id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS teachers (
    name VARCHAR(255) NOT NULL,
    id CHAR(6) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'abroad')),
    chairman BOOLEAN,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS admin (
    id CHAR(6) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO admin (id, email, password)
VALUES (
    'AD0001',
    'admin@netrokona-uni.edu.bd',
    '$2a$10$5RzQaCkJoWEYTDJG0qOc7uESaIsOcd/uKGqCe0uNUsLTUYJ73DSHW'
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    password = EXCLUDED.password;