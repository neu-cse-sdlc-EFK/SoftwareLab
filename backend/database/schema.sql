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
    password TEXT NOT NULL
);

INSERT INTO admin (id, email, password)
VALUES ('AD0001', 'admin@netrokona-uni.edu.bd', '$2a$10$5RzQaCkJoWEYTDJG0qOc7uESaIsOcd/uKGqCe0uNUsLTUYJ73DSHW');


CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    credit NUMERIC(3,2) NOT NULL,
    PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    batch INT NOT NULL,
    teacher_id CHAR(6),
    FOREIGN KEY (teacher_id)
        REFERENCES teachers(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);