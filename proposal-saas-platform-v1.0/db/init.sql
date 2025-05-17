
-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    uei TEXT,
    cage_code TEXT,
    naics TEXT[],
    psc TEXT[],
    keywords TEXT,
    sam_api_key TEXT,
    fedconnect_user TEXT,
    gsabuy_email TEXT,
    itar BOOLEAN,
    cleared BOOLEAN,
    vehicles TEXT[],
    certifications TEXT[],
    teaming BOOLEAN,
    partners TEXT,
    plan TEXT,
    max_users INTEGER,
    region TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS extension TEXT;

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS rfps (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    title TEXT NOT NULL,
    solicitation_number TEXT,
    agency TEXT NOT NULL,
    due_date DATE NOT NULL,
    naics TEXT,
    psc TEXT,
    contract_type TEXT,
    submission_method TEXT,
    notes TEXT,
    go_no_go TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
