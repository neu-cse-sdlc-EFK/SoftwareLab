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