const Database = require('better-sqlite3');
const db = new Database('dodo.db');

// Создаём таблицы при первом запуске
function initDatabase() {
  // Таблица пиццерий
  db.exec(`
    CREATE TABLE IF NOT EXISTS pizzerias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT
    )
  `);

  // Таблица пользователей (управляющие)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      pizzeria_id INTEGER,
      FOREIGN KEY (pizzeria_id) REFERENCES pizzerias(id)
    )
  `);

  // Таблица сотрудников
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position TEXT,
      pizzeria_id INTEGER NOT NULL,
      med_book_expiry DATE,
      FOREIGN KEY (pizzeria_id) REFERENCES pizzerias(id)
    )
  `);

  // Таблица еженедельных метрик
  db.exec(`
    CREATE TABLE IF NOT EXISTS weekly_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pizzeria_id INTEGER NOT NULL,
      week_date DATE NOT NULL,
      revenue REAL,
      avg_check REAL,
      quality_score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pizzeria_id) REFERENCES pizzerias(id)
    )
  `);

  console.log('✅ База данных инициализирована');
}

initDatabase();

module.exports = db;