const Database = require('better-sqlite3');
const db = new Database('dodo.db');

console.log('🔄 Running migrations...');

// ВАЖНО: Включаем foreign keys
db.pragma('foreign_keys = ON');

// Удаляем старые таблицы
db.exec(`DROP TABLE IF EXISTS weekly_metrics`);
db.exec(`DROP TABLE IF EXISTS employees`);
db.exec(`DROP TABLE IF EXISTS pizzeria_managers`);
db.exec(`DROP TABLE IF EXISTS pizzerias`);
db.exec(`DROP TABLE IF EXISTS franchisees`);
db.exec(`DROP TABLE IF EXISTS users`);

// 1. Users
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('super_admin', 'franchisee', 'manager')),
    name TEXT NOT NULL,
    franchisee_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 2. Franchisees
db.exec(`
  CREATE TABLE franchisees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER UNIQUE NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// 3. Pizzerias
db.exec(`
  CREATE TABLE pizzerias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    franchisee_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (franchisee_id) REFERENCES franchisees(id)
  )
`);

// 4. Pizzeria Managers
db.exec(`
  CREATE TABLE pizzeria_managers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manager_id INTEGER NOT NULL,
    pizzeria_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manager_id, pizzeria_id),
    FOREIGN KEY (manager_id) REFERENCES users(id),
    FOREIGN KEY (pizzeria_id) REFERENCES pizzerias(id)
  )
`);

// 5. Employees
db.exec(`
  CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    pizzeria_id INTEGER NOT NULL,
    med_book_expiry DATE,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pizzeria_id) REFERENCES pizzerias(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )
`);

// 6. Weekly Metrics
db.exec(`
  CREATE TABLE weekly_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pizzeria_id INTEGER NOT NULL,
    week_date DATE NOT NULL,
    revenue REAL,
    avg_check REAL,
    quality_score INTEGER,
    submitted_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pizzeria_id) REFERENCES pizzerias(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id)
  )
`);

console.log('✅ Migrations completed!');
db.close();
