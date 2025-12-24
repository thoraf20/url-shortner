-- Active: 1766071488412@@127.0.0.1@5432@urls
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(30) UNIQUE NOT NULL,
    long_url TEXT NOT NULL,
    click_count INT DEFAULT 0,
    expires_at TIMESTAMP,
    user_id INT REFERENCES users (id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analytics (
    id SERIAL PRIMARY KEY,
    url_id INT REFERENCES urls (id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    browser_name VARCHAR(50),
    browser_version VARCHAR(50),
    os_name VARCHAR(50),
    os_version VARCHAR(50),
    device_type VARCHAR(50),
    referer TEXT,
    clicked_at TIMESTAMP DEFAULT NOW()
);