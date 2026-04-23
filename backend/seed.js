const db = require('./database');

// Очищаем таблицы
db.exec('DELETE FROM employees');
db.exec('DELETE FROM pizzerias');

// Добавляем 6 пиццерий
const pizzerias = [
  { name: 'Додо Пицца Центр', address: 'ул. Ленина, 10' },
  { name: 'Додо Пицца Север', address: 'пр. Победы, 45' },
  { name: 'Додо Пицца Запад', address: 'ул. Гагарина, 33' },
  { name: 'Додо Пицца Восток', address: 'ул. Советская, 77' },
  { name: 'Додо Пицца Юг', address: 'ул. Мира, 21' },
  { name: 'Додо Пицца ТЦ Мега', address: 'ТЦ Мега, 2 этаж' }
];

const insertPizzeria = db.prepare('INSERT INTO pizzerias (name, address) VALUES (?, ?)');
pizzerias.forEach(p => {
  insertPizzeria.run(p.name, p.address);
});

// Добавляем сотрудников
const employees = [
  { name: 'Иванов Иван', position: 'Пиццамейкер', pizzeria_id: 1, med_book_expiry: '2026-06-15' },
  { name: 'Петрова Мария', position: 'Кассир', pizzeria_id: 1, med_book_expiry: '2026-03-20' },
  { name: 'Сидоров Петр', position: 'Пиццамейкер', pizzeria_id: 2, med_book_expiry: '2026-05-10' },
  { name: 'Козлова Анна', position: 'Управляющий', pizzeria_id: 2, med_book_expiry: '2026-12-01' },
  { name: 'Смирнов Алексей', position: 'Курьер', pizzeria_id: 3, med_book_expiry: '2026-02-28' },
  { name: 'Морозова Елена', position: 'Пиццамейкер', pizzeria_id: 4, med_book_expiry: '2026-07-15' }
];

const insertEmployee = db.prepare('INSERT INTO employees (name, position, pizzeria_id, med_book_expiry) VALUES (?, ?, ?, ?)');
employees.forEach(e => {
  insertEmployee.run(e.name, e.position, e.pizzeria_id, e.med_book_expiry);
});

console.log('✅ Тестовые данные добавлены!');
console.log(`📊 Пиццерий: ${pizzerias.length}`);
console.log(`👥 Сотрудников: ${employees.length}`);