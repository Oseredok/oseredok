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

INSERT INTO organizations (organization_id, name, description, category, contact_email)
VALUES
(UUID(), 'Debate Club', 'Student debate organization', 'Debates', 'debate@naukma.edu.ua'),
(UUID(), 'IT Society', 'Community for IT students', 'IT', 'it@naukma.edu.ua');