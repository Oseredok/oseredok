CREATE DATABASE IF NOT EXISTS student_orgs;
USE student_orgs;

CREATE TABLE IF NOT EXISTS organizations (
    organization_id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    handle VARCHAR(100) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    faculty VARCHAR(255),
<<<<<<< HEAD
    logo_url VARCHAR(255),
=======
    logo_url MEDIUMTEXT,
>>>>>>> 9121a50eb1eb6c16876595166dbb2da42ba37f96
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    instagram VARCHAR(255),
    telegram VARCHAR(255),
    website VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id CHAR(36) PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    faculty VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    event_id CHAR(36) PRIMARY KEY,
    organization_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    max_participants INT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id)
);

CREATE TABLE IF NOT EXISTS registrations (
    registration_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    event_id CHAR(36) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id)
);

CREATE TABLE IF NOT EXISTS organization_members (
    membership_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    organization_id CHAR(36) NOT NULL,
    role_in_org VARCHAR(50),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id)
);

-- Test users (password for all: password123)
INSERT INTO users (user_id, full_name, email, password_hash, role, faculty, created_at) VALUES
('u0000001-0000-4000-8000-000000000001', 'Адміністратор', 'admin@naukma.edu.ua', '$2b$12$Uikl8mEf2aQ72Myrs06m1eO8VX8JucidNS6DjTrhd9EtIzDDUniyy', 'admin', NULL, '2023-09-01 10:00:00'),
('u0000002-0000-4000-8000-000000000002', 'Олексій Литвин', 'o.lytvyn@ukma.edu.ua', '$2b$12$Uikl8mEf2aQ72Myrs06m1eO8VX8JucidNS6DjTrhd9EtIzDDUniyy', 'org_owner', 'Факультет інформатики', '2022-09-15 10:00:00'),
('u0000003-0000-4000-8000-000000000003', 'Марія Коваль', 'm.koval@ukma.edu.ua', '$2b$12$Uikl8mEf2aQ72Myrs06m1eO8VX8JucidNS6DjTrhd9EtIzDDUniyy', 'org_owner', 'Гуманітарні науки', '2024-10-20 10:00:00'),
('u0000004-0000-4000-8000-000000000004', 'Дмитро Шевченко', 'd.shevchenko@ukma.edu.ua', '$2b$12$Uikl8mEf2aQ72Myrs06m1eO8VX8JucidNS6DjTrhd9EtIzDDUniyy', 'org_owner', 'Природничі науки', '2025-05-28 10:00:00'),
('u0000005-0000-4000-8000-000000000005', 'Анна Мельник', 'a.melnyk@ukma.edu.ua', '$2b$12$Uikl8mEf2aQ72Myrs06m1eO8VX8JucidNS6DjTrhd9EtIzDDUniyy', 'org_owner', 'Гуманітарні науки', '2023-09-15 10:00:00'),
('u0000006-0000-4000-8000-000000000006', 'Василь Петренко', 'v.petrenko@ukma.edu.ua', '$2b$12$Uikl8mEf2aQ72Myrs06m1eO8VX8JucidNS6DjTrhd9EtIzDDUniyy', 'org_owner', 'Факультет інформатики', '2022-10-07 10:00:00'),
('u0000007-0000-4000-8000-000000000007', 'Соломія Бондар', 's.bondar@ukma.edu.ua', '$2b$12$Uikl8mEf2aQ72Myrs06m1eO8VX8JucidNS6DjTrhd9EtIzDDUniyy', 'org_owner', 'Соціальні науки', '2025-06-02 10:00:00'),
('u0000008-0000-4000-8000-000000000008', 'Михайло Корж', 'mykhailo@ukma.edu.ua', '$2b$12$Uikl8mEf2aQ72Myrs06m1eO8VX8JucidNS6DjTrhd9EtIzDDUniyy', 'student', 'Факультет інформатики', '2024-03-12 10:00:00'),
('u0000009-0000-4000-8000-000000000009', 'Іван Петренко', 'i.petrenko@ukma.edu.ua', '$2b$12$Uikl8mEf2aQ72Myrs06m1eO8VX8JucidNS6DjTrhd9EtIzDDUniyy', 'org_owner', 'Факультет інформатики', '2023-09-12 10:00:00'),
('u0000010-0000-4000-8000-000000000010', 'Настя Сидоренко', 'n.sydorenko@ukma.edu.ua', '$2b$12$Uikl8mEf2aQ72Myrs06m1eO8VX8JucidNS6DjTrhd9EtIzDDUniyy', 'student', 'Соціальні науки', '2025-02-03 10:00:00');

INSERT INTO organizations (organization_id, name, handle, description, category, faculty, contact_email, phone, instagram, telegram, website, status, created_at) VALUES
('o0000001-0000-4000-8000-000000000001', 'IT Club НаУКМА', 'it-club-naukma',
 'IT Club НаУКМА — це спільнота студентів, які захоплюються технологіями, програмуванням та інноваціями. Ми об''єднуємо понад 120 активних учасників з різних факультетів університету і щотижня проводимо мітапи, хакатони та воркшопи. Клуб був заснований у 2019 році з метою розвитку технічних навичок студентів та підготовки їх до кар''єри в IT-індустрії. За цей час ми провели понад 80 заходів, запустили 12 студентських проєктів і допомогли десяткам випускників знайти роботу у провідних компаніях.',
 'IT & Технології', 'НаУКМА', 'it-club@ukma.edu.ua', '+380 44 123 45 67', '@itclub_kma', '@itclub_naukma', 'itclub.ukma.edu.ua', 'active', '2024-09-12 10:00:00'),

('o0000002-0000-4000-8000-000000000002', 'KMA Дебати', 'kma-debates',
 'Студентський клуб ораторського мистецтва та дебатів НаУКМА. Щотижневі тренування, участь у національних та міжнародних турнірах.',
 'Ораторське мистецтво', 'НаУКМА', 'debates@ukma.edu.ua', NULL, '@kma_debates', '@kma_debates', NULL, 'active', '2024-02-03 10:00:00'),

('o0000003-0000-4000-8000-000000000003', 'Наукове товариство', 'science-naukma',
 'Об''єднання студентів-науковців, які займаються дослідницькою діяльністю та публікаціями.',
 'Наука та дослідження', 'НаУКМА', 'science@ukma.edu.ua', NULL, NULL, NULL, NULL, 'pending', '2025-05-28 10:00:00'),

('o0000004-0000-4000-8000-000000000004', 'Мистецька Зала', 'art-naukma',
 'Простір для творчих студентів: виставки, перформанси, літературні вечори.',
 'Культура та мистецтво', 'НаУКМА', 'art@ukma.edu.ua', NULL, '@art_naukma', NULL, NULL, 'active', '2023-09-15 10:00:00'),

('o0000005-0000-4000-8000-000000000005', 'Спортивна секція КМА', 'sport-kma',
 'Спортивні секції та змагання для студентів НаУКМА.',
 'Спорт та здоров''я', 'НаУКМА', 'sport@ukma.edu.ua', NULL, NULL, NULL, NULL, 'blocked', '2022-10-07 10:00:00'),

('o0000006-0000-4000-8000-000000000006', 'Еко-Клуб НаУКМА', 'eco-naukma',
 'Екологічна ініціатива студентів: сортування відходів, волонтерські акції, лекції про сталий розвиток.',
 'Екологія та природа', 'НаУКМА', 'eco@ukma.edu.ua', NULL, '@eco_naukma', '@eco_naukma', NULL, 'pending', '2025-06-02 10:00:00');

INSERT INTO organization_members (membership_id, user_id, organization_id, role_in_org) VALUES
('m0000001-0000-4000-8000-000000000001', 'u0000002-0000-4000-8000-000000000002', 'o0000001-0000-4000-8000-000000000001', 'owner'),
('m0000002-0000-4000-8000-000000000002', 'u0000003-0000-4000-8000-000000000003', 'o0000002-0000-4000-8000-000000000002', 'owner'),
('m0000003-0000-4000-8000-000000000003', 'u0000004-0000-4000-8000-000000000004', 'o0000003-0000-4000-8000-000000000003', 'owner'),
('m0000004-0000-4000-8000-000000000004', 'u0000005-0000-4000-8000-000000000005', 'o0000004-0000-4000-8000-000000000004', 'owner'),
('m0000005-0000-4000-8000-000000000005', 'u0000006-0000-4000-8000-000000000006', 'o0000005-0000-4000-8000-000000000005', 'owner'),
('m0000006-0000-4000-8000-000000000006', 'u0000007-0000-4000-8000-000000000007', 'o0000006-0000-4000-8000-000000000006', 'owner');

INSERT INTO events (event_id, organization_id, title, description, location, start_datetime, end_datetime, max_participants, status) VALUES
('e0000001-0000-4000-8000-000000000001', 'o0000001-0000-4000-8000-000000000001',
 'Hackathon Weekend 2026', 'Дводенний хакатон для студентів усіх факультетів.',
 'Корп. 2, велика ауд.', '2026-06-14 12:00:00', '2026-06-14 20:00:00', 120, 'active'),

('e0000002-0000-4000-8000-000000000002', 'o0000001-0000-4000-8000-000000000001',
 'Workshop: React & TypeScript basics', 'Практичний воркшоп з основ React та TypeScript.',
 'Корп. 6, ауд. 212', '2026-06-18 18:00:00', '2026-06-18 20:30:00', 40, 'active'),

('e0000003-0000-4000-8000-000000000003', 'o0000001-0000-4000-8000-000000000001',
 'Open Lecture: AI у реальних проєктах', 'Відкрита лекція про застосування штучного інтелекту.',
 'Online / Zoom', '2026-06-25 17:00:00', '2026-06-25 19:00:00', 200, 'active'),

('e0000004-0000-4000-8000-000000000004', 'o0000001-0000-4000-8000-000000000001',
 'CV & Portfolio Review для студентів', 'Індивідуальний розбір резюме та портфоліо.',
 'Корп. 1, ауд. 108', '2026-07-04 14:00:00', '2026-07-04 17:00:00', 30, 'planned'),

('e0000005-0000-4000-8000-000000000005', 'o0000001-0000-4000-8000-000000000001',
 'Hackathon Weekend 2025', 'Щорічний хакатон IT Club.',
 'Activa sala', '2025-04-14 13:00:00', '2025-04-15 01:00:00', 120, 'active'),

('e0000006-0000-4000-8000-000000000006', 'o0000001-0000-4000-8000-000000000001',
 'Git & GitHub Workshop', 'Воркшоп з системи контролю версій.',
 'Корп. 6, ауд. 212', '2025-05-20 18:00:00', '2025-05-20 20:00:00', 35, 'draft'),

('e0000007-0000-4000-8000-000000000007', 'o0000002-0000-4000-8000-000000000002',
 'Дебатний турнір KMA Open', 'Відкритий дебатний турнір для новачків.',
 'Корп. 1, ауд. 201', '2026-06-20 14:00:00', '2026-06-20 18:00:00', 50, 'active');
