const Database = require('better-sqlite3');
const crypto = require('crypto');
const db = new Database('dodo.db');

// Простой хеш пароля (в продакшене используй bcrypt)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

console.log('🌱 Seeding database...');

// 1. Создаём супер-админа
const superAdmin = db.prepare(`
  INSERT INTO users (email, password_hash, role, name) 
  VALUES (?, ?, ?, ?)
`).run('admin@dodo.local', hashPassword('admin123'), 'super_admin', 'Супер Администратор');

console.log('✅ Super admin created: admin@dodo.local / admin123');

// 2. Создаём франчайзи
const franchiseeUser1 = db.prepare(`
  INSERT INTO users (email, password_hash, role, name) 
  VALUES (?, ?, ?, ?)
`).run('franchisee1@dodo.local', hashPassword('pass123'), 'franchisee', 'Иван Петров');

const franchisee1 = db.prepare(`
  INSERT INTO franchisees (name, user_id, created_by) 
  VALUES (?, ?, ?)
`).run('Додо Пицца Москва', franchiseeUser1.lastInsertRowid, superAdmin.lastInsertRowid);

const franchiseeUser2 = db.prepare(`
  INSERT INTO users (email, password_hash, role, name) 
  VALUES (?, ?, ?, ?)
`).run('franchisee2@dodo.local', hashPassword('pass123'), 'franchisee', 'Мария Сидорова');

const franchisee2 = db.prepare(`
  INSERT INTO franchisees (name, user_id, created_by) 
  VALUES (?, ?, ?)
`).run('Додо Пицца Санкт-Петербург', franchiseeUser2.lastInsertRowid, superAdmin.lastInsertRowid);

console.log('✅ Franchisees created');

// 3. Создаём пиццерии
const pizzerias = [
  { name: 'Додо Центр', address: 'ул. Ленина, 10', franchisee_id: franchisee1.lastInsertRowid },
  { name: 'Додо Север', address: 'пр. Победы, 45', franchisee_id: franchisee1.lastInsertRowid },
  { name: 'Додо Запад', address: 'ул. Гагарина, 33', franchisee_id: franchisee1.lastInsertRowid },
  { name: 'Додо Невский', address: 'Невский пр., 100', franchisee_id: franchisee2.lastInsertRowid },
  { name: 'Додо Петроградская', address: 'Каменноостровский пр., 15', franchisee_id: franchisee2.lastInsertRowid },
  { name: 'Додо Васильевский', address: 'Средний пр., 50', franchisee_id: franchisee2.lastInsertRowid },
];

const insertPizzeria = db.prepare('INSERT INTO pizzerias (name, address, franchisee_id) VALUES (?, ?, ?)');
const pizzeriaIds = pizzerias.map(p => insertPizzeria.run(p.name, p.address, p.franchisee_id).lastInsertRowid);

console.log('✅ Pizzerias created');

// 4. Создаём управляющих
const manager1 = db.prepare(`
  INSERT INTO users (email, password_hash, role, name, franchisee_id) 
  VALUES (?, ?, ?, ?, ?)
`).run('manager1@dodo.local', hashPassword('pass123'), 'manager', 'Алексей Смирнов', franchisee1.lastInsertRowid);

const manager2 = db.prepare(`
  INSERT INTO users (email, password_hash, role, name, franchisee_id) 
  VALUES (?, ?, ?, ?, ?)
`).run('manager2@dodo.local', hashPassword('pass123'), 'manager', 'Ольга Иванова', franchisee1.lastInsertRowid);

const manager3 = db.prepare(`
  INSERT INTO users (email, password_hash, role, name, franchisee_id) 
  VALUES (?, ?, ?, ?, ?)
`).run('manager3@dodo.local', hashPassword('pass123'), 'manager', 'Дмитрий Козлов', franchisee2.lastInsertRowid);

console.log('✅ Managers created');

// 5. Привязываем управляющих к пиццериям
const linkManager = db.prepare('INSERT INTO pizzeria_managers (manager_id, pizzeria_id) VALUES (?, ?)');
linkManager.run(manager1.lastInsertRowid, pizzeriaIds[0]); // Алексей → Центр
linkManager.run(manager1.lastInsertRowid, pizzeriaIds[1]); // Алексей → Север (управляет двумя)
linkManager.run(manager2.lastInsertRowid, pizzeriaIds[2]); // Ольга → Запад
linkManager.run(manager3.lastInsertRowid, pizzeriaIds[3]); // Дмитрий → Невский
linkManager.run(manager3.lastInsertRowid, pizzeriaIds[4]); // Дмитрий → Петроградская
linkManager.run(manager3.lastInsertRowid, pizzeriaIds[5]); // Дмитрий → Васильевский

console.log('✅ Managers linked to pizzerias');

// 6. Создаём сотрудников
const employees = [
  { name: 'Иванов Иван', position: 'Пиццамейкер', pizzeria_id: pizzeriaIds[0], expiry: '2026-06-15', creator: manager1.lastInsertRowid },
  { name: 'Петрова Мария', position: 'Кассир', pizzeria_id: pizzeriaIds[0], expiry: '2026-03-20', creator: manager1.lastInsertRowid },
  { name: 'Сидоров Петр', position: 'Пиццамейкер', pizzeria_id: pizzeriaIds[1], expiry: '2026-05-10', creator: manager1.lastInsertRowid },
  { name: 'Козлова Анна', position: 'Кассир', pizzeria_id: pizzeriaIds[2], expiry: '2026-12-01', creator: manager2.lastInsertRowid },
  { name: 'Смирнов Алексей', position: 'Курьер', pizzeria_id: pizzeriaIds[3], expiry: '2026-02-28', creator: manager3.lastInsertRowid },
  { name: 'Морозова Елена', position: 'Пиццамейкер', pizzeria_id: pizzeriaIds[4], expiry: '2026-07-15', creator: manager3.lastInsertRowid },
];

const insertEmployee = db.prepare('INSERT INTO employees (name, position, pizzeria_id, med_book_expiry, created_by) VALUES (?, ?, ?, ?, ?)');
employees.forEach(e => insertEmployee.run(e.name, e.position, e.pizzeria_id, e.expiry, e.creator));

console.log('✅ Employees created');

console.log('\n🎉 Seeding complete!');
console.log('\n📝 Test credentials:');
console.log('Super Admin: admin@dodo.local / admin123');
console.log('Franchisee 1: franchisee1@dodo.local / pass123');
console.log('Franchisee 2: franchisee2@dodo.local / pass123');
console.log('Manager 1: manager1@dodo.local / pass123');
console.log('Manager 2: manager2@dodo.local / pass123');
console.log('Manager 3: manager3@dodo.local / pass123');

db.close();
