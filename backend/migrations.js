const Database = require('better-sqlite3');
const db = new Database('dodo.db');

db.pragma('foreign_keys = OFF');

// Users
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('super_admin', 'franchisee', 'manager')) NOT NULL,
    name TEXT NOT NULL,
    franchisee_id INTEGER,
    FOREIGN KEY (franchisee_id) REFERENCES franchisees(id)
  )
`);

// Franchisees
db.exec(`
  CREATE TABLE IF NOT EXISTS franchisees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER UNIQUE NOT NULL,
    created_by INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )
`);

// Pizzerias
db.exec(`
  CREATE TABLE IF NOT EXISTS pizzerias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    franchisee_id INTEGER NOT NULL,
    FOREIGN KEY (franchisee_id) REFERENCES franchisees(id)
  )
`);

// Pizzeria Managers junction
db.exec(`
  CREATE TABLE IF NOT EXISTS pizzeria_managers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manager_id INTEGER NOT NULL,
    pizzeria_id INTEGER NOT NULL,
    FOREIGN KEY (manager_id) REFERENCES users(id),
    FOREIGN KEY (pizzeria_id) REFERENCES pizzerias(id)
  )
`);

// Employees
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    pizzeria_id INTEGER NOT NULL,
    med_book_expiry DATE,
    created_by INTEGER,
    FOREIGN KEY (pizzeria_id) REFERENCES pizzerias(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )
`);

// Medical test templates (болванки анализов)
db.exec(`
  CREATE TABLE IF NOT EXISTS medical_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    periodicity_days INTEGER NOT NULL,
    franchisee_id INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (franchisee_id) REFERENCES franchisees(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )
`);

// Employee medical tests (конкретные анализы сотрудника)
db.exec(`
  CREATE TABLE IF NOT EXISTS employee_medical_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    medical_test_id INTEGER NOT NULL,
    expiry_date DATE NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (medical_test_id) REFERENCES medical_tests(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )
`);

// Weekly Metrics
db.exec(`
  CREATE TABLE IF NOT EXISTS weekly_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pizzeria_id INTEGER NOT NULL,
    week_date DATE NOT NULL,
    revenue DECIMAL(10, 2),
    avg_check DECIMAL(10, 2),
    quality_score DECIMAL(3, 2),
    submitted_by INTEGER,
    FOREIGN KEY (pizzeria_id) REFERENCES pizzerias(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id)
  )
`);

console.log('✅ Database schema created successfully!');
db.close();
