CREATE DATABASE IF NOT EXISTS student_orgs;
USE student_orgs;

CREATE TABLE IF NOT EXISTS organizations (
    organization_id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    logo_url VARCHAR(255),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id CHAR(36) PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
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

INSERT INTO organizations (organization_id, name, description, category, contact_email)
VALUES
(UUID(), 'Debate Club', 'Student debate organization', 'Debates', 'debate@naukma.edu.ua'),
(UUID(), 'IT Society', 'Community for IT students', 'IT', 'it@naukma.edu.ua');