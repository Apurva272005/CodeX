-- CodeX Database Schema
-- Run this after creating the database: CREATE DATABASE codex_db;

USE codex_db;

-- Users master table (linked to Clerk)
CREATE TABLE IF NOT EXISTS users (
  id           VARCHAR(255) NOT NULL PRIMARY KEY,
  email        VARCHAR(255) NOT NULL UNIQUE,
  name         VARCHAR(255) NOT NULL,
  role         ENUM('student','faculty','admin') NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Student sub-table
CREATE TABLE IF NOT EXISTS students (
  user_id       VARCHAR(255) NOT NULL PRIMARY KEY,
  enrollment_no VARCHAR(100) NOT NULL UNIQUE,
  department    VARCHAR(100) NOT NULL,
  year          TINYINT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Faculty sub-table
CREATE TABLE IF NOT EXISTS faculty (
  user_id     VARCHAR(255) NOT NULL PRIMARY KEY,
  department  VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin sub-table
CREATE TABLE IF NOT EXISTS admins (
  user_id     VARCHAR(255) NOT NULL PRIMARY KEY,
  staff_id    VARCHAR(100) NOT NULL UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hackathons
CREATE TABLE IF NOT EXISTS hackathons (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  banner_url      VARCHAR(500) NOT NULL DEFAULT '',
  type            ENUM('government','private','internal') NOT NULL,
  field           VARCHAR(100) NOT NULL,
  prize_pool      VARCHAR(100) NOT NULL,
  max_team_size   TINYINT NOT NULL DEFAULT 4,
  min_team_size   TINYINT NOT NULL DEFAULT 1,
  start_date      DATETIME NOT NULL,
  end_date        DATETIME NOT NULL,
  enroll_deadline DATETIME NOT NULL,
  venue           VARCHAR(255) NOT NULL,
  status          ENUM('upcoming','active','closed') NOT NULL DEFAULT 'upcoming',
  created_by      VARCHAR(255) NOT NULL,
  approved        TINYINT NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Enrollments (team registration per hackathon)
CREATE TABLE IF NOT EXISTS enrollments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  hackathon_id  INT NOT NULL,
  team_name     VARCHAR(255) NOT NULL,
  mode          ENUM('solo','duo','group') NOT NULL,
  leader_id     VARCHAR(255) NOT NULL,
  submitted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE,
  FOREIGN KEY (leader_id) REFERENCES users(id)
);

-- Enrollment members
CREATE TABLE IF NOT EXISTS enrollment_members (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  enrollment_id INT NOT NULL,
  student_id    VARCHAR(255) NOT NULL,
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  hackathon_id  INT NOT NULL,
  student_id    VARCHAR(255) NOT NULL,
  remind_at     DATETIME NOT NULL,
  sent          TINYINT NOT NULL DEFAULT 0,
  FOREIGN KEY (hackathon_id) REFERENCES hackathons(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Sample admin user (update user_id with actual Clerk ID after first sign-in)
-- INSERT INTO users (id, email, name, role) VALUES ('admin_clerk_id', 'admin@university.edu', 'Admin User', 'admin');
-- INSERT INTO admins (user_id, staff_id) VALUES ('admin_clerk_id', 'ADMIN001');
