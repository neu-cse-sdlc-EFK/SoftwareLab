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

-- Password for all students: 123456
-- Bcrypt hash: $2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C

INSERT INTO students
(name, id, email, password, batch, session, roll, exam_roll, status)
VALUES

-- =========================
-- BATCH 1 — SESSION 2019-20
-- =========================

('Rahim Ahmed', '201900001', 'rahim.ahmed@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 1, '2019-20', 1, 1001, 'active'),

('Karim Hasan', '201900002', 'karim.hasan@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 1, '2019-20', 2, 1002, 'active'),

('Sakib Hossain', '201900003', 'sakib.hossain@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 1, '2019-20', 3, 1003, 'active'),

('Nusrat Jahan', '201900004', 'nusrat.jahan@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 1, '2019-20', 4, 1004, 'active'),

('Tanvir Rahman', '201900005', 'tanvir.rahman@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 1, '2019-20', 5, 1005, 'active'),


-- =========================
-- BATCH 2 — SESSION 2020-21
-- =========================

('Mehedi Hasan', '202000001', 'mehedi.hasan@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 2, '2020-21', 1, 2001, 'active'),

('Arafat Hossain', '202000002', 'arafat.hossain@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 2, '2020-21', 2, 2002, 'active'),

('Siam Ahmed', '202000003', 'siam.ahmed@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 2, '2020-21', 3, 2003, 'active'),

('Jannatul Ferdous', '202000004', 'jannatul.ferdous@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 2, '2020-21', 4, 2004, 'active'),

('Rafiul Islam', '202000005', 'rafiul.islam@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 2, '2020-21', 5, 2005, 'active'),


-- =========================
-- BATCH 3 — SESSION 2021-22
-- =========================

('Shakil Ahmed', '202100001', 'shakil.ahmed@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 3, '2021-22', 1, 3001, 'active'),

('Fahim Rahman', '202100002', 'fahim.rahman@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 3, '2021-22', 2, 3002, 'active'),

('Imran Hossain', '202100003', 'imran.hossain@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 3, '2021-22', 3, 3003, 'active'),

('Sadia Islam', '202100004', 'sadia.islam@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 3, '2021-22', 4, 3004, 'active'),

('Rakibul Hasan', '202100005', 'rakibul.hasan@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 3, '2021-22', 5, 3005, 'active'),


-- =========================
-- BATCH 4 — SESSION 2022-23
-- =========================

('Abdullah Al Mamun', '202200001', 'abdullah.mamun@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 4, '2022-23', 1, 4001, 'active'),

('Hasan Mahmud', '202200002', 'hasan.mahmud@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 4, '2022-23', 2, 4002, 'active'),

('Nayeem Islam', '202200003', 'nayeem.islam@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 4, '2022-23', 3, 4003, 'active'),

('Mim Akter', '202200004', 'mim.akter@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 4, '2022-23', 4, 4004, 'active'),

('Sabbir Hossain', '202200005', 'sabbir.hossain@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 4, '2022-23', 5, 4005, 'active'),


-- =========================
-- BATCH 5 — SESSION 2023-24
-- =========================

('Arif Hossain', '202300001', 'arif.hossain@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 5, '2023-24', 1, 5001, 'active'),

('Rahat Khan', '202300002', 'rahat.khan@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 5, '2023-24', 2, 5002, 'active'),

('Shuvo Ahmed', '202300003', 'shuvo.ahmed@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 5, '2023-24', 3, 5003, 'active'),

('Tanjim Hasan', '202300004', 'tanjim.hasan@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 5, '2023-24', 4, 5004, 'active'),

('Priya Saha', '202300005', 'priya.saha@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 5, '2023-24', 5, 5005, 'active'),


-- =========================
-- BATCH 6 — SESSION 2024-25
-- =========================

('Emon Ahmed', '202400001', 'emon.ahmed@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 6, '2024-25', 1, 6001, 'active'),

('Adnan Karim', '202400002', 'adnan.karim@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 6, '2024-25', 2, 6002, 'active'),

('Riad Hasan', '202400003', 'riad.hasan@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 6, '2024-25', 3, 6003, 'active'),

('Mahiya Islam', '202400004', 'mahiya.islam@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 6, '2024-25', 4, 6004, 'active'),

('Jubayer Hossain', '202400005', 'jubayer.hossain@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 6, '2024-25', 5, 6005, 'active'),


-- =========================
-- BATCH 7 — SESSION 2025-26
-- =========================

('Emam Hasan', '202500001', 'emam.hasan@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 7, '2025-26', 1, 7001, 'active'),

('Saif Rahman', '202500002', 'saif.rahman@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 7, '2025-26', 2, 7002, 'active'),

('Tahmid Ahmed', '202500003', 'tahmid.ahmed@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 7, '2025-26', 3, 7003, 'active'),

('Raisa Jahan', '202500004', 'raisa.jahan@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 7, '2025-26', 4, 7004, 'active'),

('Nabil Hasan', '202500005', 'nabil.hasan@neu.ac.bd',
 '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
 7, '2025-26', 5, 7005, 'active');

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
-- Password for all teachers: 123456
-- Bcrypt hash:
-- $2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C

INSERT INTO teachers
(name, id, email, password, status, chairman)
VALUES

-- =========================================
-- CHAIRMAN
-- =========================================

(
    'Abdullah Al Shiam',
    'T00001',
    'shiam.cse@neu.ac.bd',
    '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
    'active',
    TRUE
),

-- =========================================
-- ASSISTANT PROFESSORS
-- =========================================

(
    'Shahnaj Parvin',
    'T00002',
    'sparvin@neu.ac.bd',
    '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
    'active',
    FALSE
),

(
    'Md Anwarul Islam Abir',
    'T00003',
    'Anwar.abir@neu.ac.bd',
    '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
    'active',
    FALSE
),

-- =========================================
-- LECTURERS
-- =========================================

(
    'Md. Mafiul Hasan Matin',
    'T00004',
    'mafiul.matin@neu.ac.bd',
    '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
    'active',
    FALSE
),

(
    'Farida Siddiqi Prity',
    'T00005',
    'prity@neu.ac.bd',
    '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
    'active',
    FALSE
),

(
    'Kohinur Parvin',
    'T00006',
    'kohinur.parvin@neu.ac.bd',
    '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
    'active',
    FALSE
),

(
    'Md. Shovon',
    'T00007',
    'mdshovon@neu.ac.bd',
    '$2y$12$RRE/sxk6N/6vfYUBp132F.uMdef2jf48x1nBpai/XZAvQowyOdq9C',
    'active',
    FALSE
);

CREATE TABLE IF NOT EXISTS admin (
    id CHAR(6) NOT NULL, 
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    PRIMARY KEY(id)
);

INSERT INTO admin (id, email, password)
VALUES ('AD0001', 'admin@netrokona-uni.edu.bd', '$2a$10$5RzQaCkJoWEYTDJG0qOc7uESaIsOcd/uKGqCe0uNUsLTUYJ73DSHW');


CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    credit NUMERIC(3,2) NOT NULL,
    PRIMARY KEY (id)
);
INSERT INTO courses (id, name, credit) VALUES

-- =========================================
-- SEMESTER I
-- =========================================

('CSE-1101', 'Fundamentals of Computers and Computing', 2.00),
('CSE-1102', 'Discrete Mathematics', 3.00),
('EEE-1103', 'Electrical Circuits', 3.00),
('PHY-1104', 'Physics', 3.00),
('MATH-1105', 'Differential and Integral Calculus', 3.00),

('CSE-1111', 'Fundamentals of Computer and Computing Lab', 1.50),
('EEE-1113', 'Electrical Circuits Lab', 1.50),
('PHY-1114', 'Physics Lab', 1.50),


-- =========================================
-- SEMESTER II
-- =========================================

('CSE-1201', 'Fundamentals of Programming', 3.00),
('EEE-1202', 'Digital Logic Design', 3.00),
('CHE-1203', 'Chemistry', 3.00),
('MATH-1204', 'Method of Integration, Differential Equations, and Series', 3.00),

('CSE-1211', 'Fundamentals of Programming Lab', 3.00),
('EEE-1212', 'Digital Logic Design Lab', 1.50),
('ENG-1215', 'Developing English Language Skill Lab', 1.50),


-- =========================================
-- SEMESTER III
-- =========================================

('CSE-2101', 'Data Structures and Algorithms', 3.00),
('CSE-2102', 'Object Oriented Programming', 3.00),
('EEE-2103', 'Electronic Devices and Circuits', 3.00),
('GED-2104', 'Bangladesh Studies', 2.00),
('MATH-2105', 'Linear Algebra', 3.00),

('CSE-2111', 'Data Structures and Algorithms Lab', 1.50),
('CSE-2112', 'Object Oriented Programming Lab', 1.50),
('EEE-2113', 'Electronic Devices and Circuits Lab', 0.75),


-- =========================================
-- SEMESTER IV
-- =========================================

('CSE-2201', 'Database Management Systems-I', 3.00),
('CSE-2202', 'Design and Analysis of Algorithms-I', 3.00),
('CSE-2203', 'Data and Telecommunication', 3.00),
('CSE-2204', 'Computer Architecture and Organization', 3.00),
('CSE-2205', 'Introduction to Mechatronics', 2.00),

('CSE-2211', 'Database Management Systems-I Lab', 1.50),
('CSE-2212', 'Design and Analysis of Algorithms-I Lab', 1.50),
('CSE-2216', 'Application Development Lab', 1.50),


-- =========================================
-- SEMESTER V
-- =========================================

('CSE-3101', 'Computer Networking', 3.00),
('CSE-3102', 'Software Engineering', 3.00),
('CSE-3103', 'Microprocessor and Microcontroller', 3.00),
('CSE-3104', 'Formal Language, Automata and Computability', 3.00),
('MATH-3105', 'Multivariable Calculus and Geometry', 3.00),

('CSE-3111', 'Computer Networking Lab', 1.50),
('CSE-3112', 'Software Engineering Lab', 0.75),
('CSE-3113', 'Microprocessor and Assembly Language Lab', 1.50),
('CSE-3116', 'Microcontroller Lab', 0.75),


-- =========================================
-- SEMESTER VI
-- =========================================

('CSE-3201', 'Operating Systems', 3.00),
('CSE-3202', 'Numerical Methods', 3.00),
('CSE-3203', 'Digital Image Processing', 3.00),
('CSE-3204', 'Compiler Design', 3.00),
('STAT-3205', 'Introduction to Probability and Statistics', 3.00),

('CSE-3211', 'Operating Systems Lab', 1.50),
('CSE-3212', 'Numerical Methods Lab', 0.75),
('CSE-3213', 'Digital Image Processing Lab', 1.50),
('CSE-3214', 'Compiler Design Lab', 0.75),
('CSE-3217', 'Technical Writing and Presentation Lab', 0.75),


-- =========================================
-- SEMESTER VII
-- =========================================

('CSE-4101', 'Artificial Intelligence', 3.00),
('CSE-4102', 'Mathematical and Statistical Analysis for Engineers', 3.00),

-- NOTE: CSE-4103 is also used by Option-I.
('CSE-4103', 'Graph Theory', 3.00),

('CSE-4110', 'Artificial Intelligence Lab', 1.50),

('CSE-4113', 'Internet and Web Programming Lab', 1.50),
('CSE-4114', 'Thesis/Project', 2.00),


-- =========================================
-- SEMESTER VIII
-- =========================================

('ECO-4201', 'Economics', 2.00),
('CSE-4202', 'Society and Technology', 2.00),

('CSE-4214', 'Thesis/Project', 4.00);


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