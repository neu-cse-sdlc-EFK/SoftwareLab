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
    PRIMARY KEY(id)
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

CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    credit NUMERIC(3,2) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(20),
    name VARCHAR(255),
    batch INT NOT NULL,
    teacher_id CHAR(6),
    FOREIGN KEY (teacher_id)
        REFERENCES teachers(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (course_id)
REFERENCES courses(id)
ON UPDATE CASCADE
ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notice (
    id SERIAL PRIMARY KEY,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    classroom_id INT NOT NULL,
    notice TEXT,
    FOREIGN KEY (classroom_id)
        REFERENCES classrooms(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    classroom_id INT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    sender_id VARCHAR(9) NOT NULL,
    sender_role VARCHAR(10) NOT NULL CHECK (sender_role IN ('student', 'teacher')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notices (
    id SERIAL PRIMARY KEY,
    classroom_id INT REFERENCES classrooms(id) ON DELETE CASCADE, -- NULL = department-wide
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    tag VARCHAR(20) NOT NULL DEFAULT 'general' CHECK (tag IN ('urgent', 'general', 'assignment')),
    posted_by CHAR(6) REFERENCES teachers(id),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classroom_files (
    id SERIAL PRIMARY KEY,
    classroom_id INT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    uploaded_by VARCHAR(9) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);