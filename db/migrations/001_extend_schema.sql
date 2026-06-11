USE student_orgs;

ALTER TABLE organizations ADD COLUMN handle VARCHAR(100) UNIQUE;
ALTER TABLE organizations ADD COLUMN faculty VARCHAR(255);
ALTER TABLE organizations ADD COLUMN instagram VARCHAR(255);
ALTER TABLE organizations ADD COLUMN telegram VARCHAR(255);
ALTER TABLE organizations ADD COLUMN website VARCHAR(255);
ALTER TABLE organizations ADD COLUMN phone VARCHAR(50);
ALTER TABLE organizations ADD COLUMN status VARCHAR(50) DEFAULT 'active';

ALTER TABLE events ADD COLUMN status VARCHAR(50) DEFAULT 'active';

ALTER TABLE users ADD COLUMN faculty VARCHAR(255);
