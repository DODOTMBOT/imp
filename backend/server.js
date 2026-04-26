require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const app = express();
const db = new Database('dodo.db');
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

db.pragma('foreign_keys = ON');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Слишком много запросов, попробуйте позже'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Слишком много попыток входа, попробуйте через 15 минут'
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(generalLimiter);

// ============= AUTH MIDDLEWARE =============

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// ============= VALIDATION =============

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ============= AUTH ENDPOINTS =============

app.post('/login',
  loginLimiter,
  body('email').isEmail().withMessage('Введите корректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль минимум 6 символов'),
  handleValidationErrors,
  async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    let franchisee_id = user.franchisee_id;
    if (user.role === 'franchisee') {
      const franchisee = db.prepare('SELECT id FROM franchisees WHERE user_id = ?').get(user.id);
      franchisee_id = franchisee?.id || null;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        franchisee_id: franchisee_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        franchisee_id: franchisee_id
      }
    });
  } catch (error) {
    next(error);
  }
});

app.post('/logout', authenticateToken, (_req, res) => {
  res.json({ success: true });
});

app.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

// ============= FRANCHISEES =============

app.get('/franchisees', authenticateToken, (req, res) => {
  if (req.user.role === 'franchisee') {
    const franchisee = db.prepare(`
      SELECT f.*, u.name as user_name, u.email 
      FROM franchisees f 
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `).get(req.user.franchisee_id);
    return res.json([franchisee]);
  }
  
  const franchisees = db.prepare(`
    SELECT f.*, u.name as user_name, u.email 
    FROM franchisees f 
    JOIN users u ON f.user_id = u.id
  `).all();
  res.json(franchisees);
});

app.post('/franchisees',
  authenticateToken,
  body('name').isLength({ min: 2 }).withMessage('Название минимум 2 символа'),
  body('email').isEmail().withMessage('Введите корректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль минимум 6 символов'),
  handleValidationErrors,
  async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    const { name, email, password, created_by } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = db.prepare(
      'INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)'
    ).run(email, passwordHash, 'franchisee', name);

    const franchiseeResult = db.prepare(
      'INSERT INTO franchisees (name, user_id, created_by) VALUES (?, ?, ?)'
    ).run(name, userResult.lastInsertRowid, created_by);

    res.json({ id: franchiseeResult.lastInsertRowid });
  } catch (error) {
    next(error);
  }
});

app.put('/franchisees/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  
  const { id } = req.params;
  const { name, email } = req.body;
  
  const franchisee = db.prepare('SELECT user_id FROM franchisees WHERE id = ?').get(id);
  
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, franchisee.user_id);
  db.prepare('UPDATE franchisees SET name = ? WHERE id = ?').run(name, id);
  
  res.json({ success: true });
});

app.delete('/franchisees/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Доступ запрещён' });
  }
  
  const { id } = req.params;
  const franchisee = db.prepare('SELECT user_id FROM franchisees WHERE id = ?').get(id);
  
  db.prepare('DELETE FROM employee_medical_tests WHERE employee_id IN (SELECT id FROM employees WHERE pizzeria_id IN (SELECT id FROM pizzerias WHERE franchisee_id = ?))').run(id);
  db.prepare('DELETE FROM employees WHERE pizzeria_id IN (SELECT id FROM pizzerias WHERE franchisee_id = ?)').run(id);
  db.prepare('DELETE FROM pizzeria_managers WHERE pizzeria_id IN (SELECT id FROM pizzerias WHERE franchisee_id = ?)').run(id);
  db.prepare('DELETE FROM pizzerias WHERE franchisee_id = ?').run(id);
  db.prepare('DELETE FROM pizzeria_managers WHERE manager_id IN (SELECT id FROM users WHERE franchisee_id = ?)').run(id);
  db.prepare('DELETE FROM users WHERE franchisee_id = ?').run(id);
  db.prepare('DELETE FROM franchisees WHERE id = ?').run(id);
  db.prepare('DELETE FROM users WHERE id = ?').run(franchisee.user_id);
  
  res.json({ success: true });
});

// ============= PIZZERIAS =============

app.get('/pizzerias', authenticateToken, (req, res) => {
  const { franchisee_id } = req.query;
  
  let query = `
    SELECT p.*, f.name as franchisee_name 
    FROM pizzerias p 
    JOIN franchisees f ON p.franchisee_id = f.id
  `;
  
  if (req.user.role === 'franchisee') {
    query += ` WHERE p.franchisee_id = ?`;
    const pizzerias = db.prepare(query).all(req.user.franchisee_id);
    return res.json(pizzerias);
  }
  
  if (req.user.role === 'manager') {
    const pizzerias = db.prepare(`
      SELECT p.*, f.name as franchisee_name 
      FROM pizzerias p
      JOIN franchisees f ON p.franchisee_id = f.id
      JOIN pizzeria_managers pm ON p.id = pm.pizzeria_id
      WHERE pm.manager_id = ?
    `).all(req.user.id);
    return res.json(pizzerias);
  }
  
  if (franchisee_id) {
    query += ` WHERE p.franchisee_id = ?`;
    const pizzerias = db.prepare(query).all(franchisee_id);
    return res.json(pizzerias);
  }
  
  const pizzerias = db.prepare(query).all();
  res.json(pizzerias);
});

app.post('/pizzerias',
  authenticateToken,
  body('name').trim().isLength({ min: 2 }).withMessage('Название минимум 2 символа'),
  body('address').trim().notEmpty().withMessage('Адрес обязателен'),
  body('franchisee_id').isInt().withMessage('Некорректный franchisee_id'),
  handleValidationErrors,
  (req, res) => {
  const { name, address, franchisee_id } = req.body;
  const result = db.prepare(
    'INSERT INTO pizzerias (name, address, franchisee_id) VALUES (?, ?, ?)'
  ).run(name, address, franchisee_id);
  res.json({ id: result.lastInsertRowid });
});

app.put('/pizzerias/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;
  
  db.prepare('UPDATE pizzerias SET name = ?, address = ? WHERE id = ?').run(name, address, id);
  res.json({ success: true });
});

app.delete('/pizzerias/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'super_admin') {
    const pizzeria = db.prepare('SELECT franchisee_id FROM pizzerias WHERE id = ?').get(id);
    if (!pizzeria || pizzeria.franchisee_id !== req.user.franchisee_id) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
  }

  db.prepare('DELETE FROM employee_medical_tests WHERE employee_id IN (SELECT id FROM employees WHERE pizzeria_id = ?)').run(id);
  db.prepare('DELETE FROM employees WHERE pizzeria_id = ?').run(id);
  db.prepare('DELETE FROM pizzeria_managers WHERE pizzeria_id = ?').run(id);
  db.prepare('DELETE FROM pizzerias WHERE id = ?').run(id);
  res.json({ success: true });
});

// ============= MANAGERS =============

app.get('/managers', authenticateToken, (req, res) => {
  const { franchisee_id } = req.query;
  
  let query = `SELECT * FROM users WHERE role = 'manager'`;
  
  if (req.user.role === 'franchisee') {
    query += ` AND franchisee_id = ?`;
    const managers = db.prepare(query).all(req.user.franchisee_id);
    return res.json(managers);
  }
  
  if (franchisee_id) {
    query += ` AND franchisee_id = ?`;
    const managers = db.prepare(query).all(franchisee_id);
    return res.json(managers);
  }
  
  const managers = db.prepare(query).all();
  res.json(managers);
});

app.get('/managers/:id/pizzerias', authenticateToken, (req, res) => {
  const { id } = req.params;
  const pizzerias = db.prepare(`
    SELECT p.* 
    FROM pizzerias p
    JOIN pizzeria_managers pm ON p.id = pm.pizzeria_id
    WHERE pm.manager_id = ?
  `).all(id);
  res.json(pizzerias);
});

app.post('/managers',
  authenticateToken,
  body('name').trim().isLength({ min: 2 }).withMessage('Имя минимум 2 символа'),
  body('email').isEmail().withMessage('Введите корректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль минимум 6 символов'),
  body('franchisee_id').isInt().withMessage('Некорректный franchisee_id'),
  body('pizzeria_ids').isArray().withMessage('pizzeria_ids должен быть массивом'),
  handleValidationErrors,
  async (req, res, next) => {
  try {
    const { name, email, password, franchisee_id, pizzeria_ids } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const result = db.prepare(
      'INSERT INTO users (email, password_hash, role, name, franchisee_id) VALUES (?, ?, ?, ?, ?)'
    ).run(email, passwordHash, 'manager', name, franchisee_id);

    const managerId = result.lastInsertRowid;

    const linkStmt = db.prepare('INSERT INTO pizzeria_managers (manager_id, pizzeria_id) VALUES (?, ?)');
    pizzeria_ids.forEach(pid => linkStmt.run(managerId, pid));

    res.json({ id: managerId });
  } catch (error) {
    next(error);
  }
});

app.put('/managers/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, pizzeria_ids } = req.body;
  
  db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id);
  db.prepare('DELETE FROM pizzeria_managers WHERE manager_id = ?').run(id);
  
  const linkStmt = db.prepare('INSERT INTO pizzeria_managers (manager_id, pizzeria_id) VALUES (?, ?)');
  pizzeria_ids.forEach(pid => linkStmt.run(id, pid));
  
  res.json({ success: true });
});

app.delete('/managers/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM pizzeria_managers WHERE manager_id = ?').run(id);
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true });
});

// ============= EMPLOYEES =============

app.get('/employees', authenticateToken, (req, res) => {
  const { pizzeria_id, franchisee_id } = req.query;
  
  let query = `
    SELECT e.*, p.name as pizzeria_name, f.name as franchisee_name
    FROM employees e
    JOIN pizzerias p ON e.pizzeria_id = p.id
    JOIN franchisees f ON p.franchisee_id = f.id
  `;
  
  const conditions = [];
  const params = [];
  
  if (req.user.role === 'franchisee') {
    conditions.push('p.franchisee_id = ?');
    params.push(req.user.franchisee_id);
  } else if (req.user.role === 'manager') {
    conditions.push('p.id IN (SELECT pizzeria_id FROM pizzeria_managers WHERE manager_id = ?)');
    params.push(req.user.id);
  } else {
    if (pizzeria_id) {
      conditions.push('e.pizzeria_id = ?');
      params.push(pizzeria_id);
    }
    
    if (franchisee_id) {
      conditions.push('p.franchisee_id = ?');
      params.push(franchisee_id);
    }
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  const employees = db.prepare(query).all(...params);
  res.json(employees);
});

app.post('/employees',
  authenticateToken,
  body('name').trim().isLength({ min: 2 }).withMessage('Имя минимум 2 символа'),
  body('position').notEmpty().withMessage('Должность обязательна'),
  body('pizzeria_id').isInt().withMessage('Некорректный pizzeria_id'),
  body('med_book_expiry').isDate().withMessage('Некорректная дата'),
  handleValidationErrors,
  (req, res) => {
  const { name, position, pizzeria_id, med_book_expiry, created_by } = req.body;
  const result = db.prepare(
    'INSERT INTO employees (name, position, pizzeria_id, med_book_expiry, created_by) VALUES (?, ?, ?, ?, ?)'
  ).run(name, position, pizzeria_id, med_book_expiry, created_by);
  res.json({ id: result.lastInsertRowid });
});

app.put('/employees/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, position, med_book_expiry } = req.body;
  
  db.prepare(
    'UPDATE employees SET name = ?, position = ?, med_book_expiry = ? WHERE id = ?'
  ).run(name, position, med_book_expiry, id);
  
  res.json({ success: true });
});

app.delete('/employees/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM employee_medical_tests WHERE employee_id = ?').run(id);
  db.prepare('DELETE FROM employees WHERE id = ?').run(id);
  res.json({ success: true });
});

// ============= STATS =============

app.get('/stats', authenticateToken, (req, res) => {
  const { franchisee_id } = req.query;
  
  let pizzeriaCount, employeeCount, healthAlerts;
  let actualFranchiseeId = franchisee_id;
  
  if (req.user.role === 'franchisee') {
    actualFranchiseeId = req.user.franchisee_id;
  }
  
  if (actualFranchiseeId) {
    pizzeriaCount = db.prepare('SELECT COUNT(*) as count FROM pizzerias WHERE franchisee_id = ?').get(actualFranchiseeId).count;
    employeeCount = db.prepare(`
      SELECT COUNT(*) as count FROM employees e 
      JOIN pizzerias p ON e.pizzeria_id = p.id 
      WHERE p.franchisee_id = ?
    `).get(actualFranchiseeId).count;
  } else if (req.user.role === 'manager') {
    pizzeriaCount = db.prepare('SELECT COUNT(*) as count FROM pizzeria_managers WHERE manager_id = ?').get(req.user.id).count;
    employeeCount = db.prepare(`
      SELECT COUNT(*) as count FROM employees e
      JOIN pizzeria_managers pm ON e.pizzeria_id = pm.pizzeria_id
      WHERE pm.manager_id = ?
    `).get(req.user.id).count;
  } else {
    pizzeriaCount = db.prepare('SELECT COUNT(*) as count FROM pizzerias').get().count;
    employeeCount = db.prepare('SELECT COUNT(*) as count FROM employees').get().count;
  }
  
  const in30days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  let healthQuery = `
    SELECT COUNT(*) as count FROM employees e
    JOIN pizzerias p ON e.pizzeria_id = p.id
    WHERE e.med_book_expiry <= ?
  `;
  
  if (actualFranchiseeId) {
    healthQuery += ' AND p.franchisee_id = ?';
    healthAlerts = db.prepare(healthQuery).get(in30days, actualFranchiseeId).count;
  } else if (req.user.role === 'manager') {
    healthQuery += ' AND p.id IN (SELECT pizzeria_id FROM pizzeria_managers WHERE manager_id = ?)';
    healthAlerts = db.prepare(healthQuery).get(in30days, req.user.id).count;
  } else {
    healthAlerts = db.prepare(healthQuery).get(in30days).count;
  }
  
  res.json({
    pizzeriaCount,
    employeeCount,
    healthAlerts,
    avgStaffing: 87
  });
});


// ============= MEDICAL TESTS (Templates) =============

app.get('/medical-tests', authenticateToken, (req, res) => {
  let query = 'SELECT * FROM medical_tests';
  
  if (req.user.role === 'franchisee') {
    query += ' WHERE franchisee_id = ?';
    const tests = db.prepare(query).all(req.user.franchisee_id);
    return res.json(tests);
  }
  
  if (req.user.role === 'manager') {
    const pizzerias = db.prepare(`
      SELECT DISTINCT p.franchisee_id 
      FROM pizzerias p
      JOIN pizzeria_managers pm ON p.id = pm.pizzeria_id
      WHERE pm.manager_id = ?
    `).all(req.user.id);
    
    if (pizzerias.length > 0) {
      const franchiseeId = pizzerias[0].franchisee_id;
      const tests = db.prepare('SELECT * FROM medical_tests WHERE franchisee_id = ?').all(franchiseeId);
      return res.json(tests);
    }
    return res.json([]);
  }
  
  const tests = db.prepare(query).all();
  res.json(tests);
});

app.post('/medical-tests', authenticateToken, (req, res) => {
  const { name, periodicity_days, franchisee_id } = req.body;
  
  const result = db.prepare(
    'INSERT INTO medical_tests (name, periodicity_days, franchisee_id, created_by) VALUES (?, ?, ?, ?)'
  ).run(name, periodicity_days, franchisee_id, req.user.id);
  
  res.json({ id: result.lastInsertRowid });
});

app.put('/medical-tests/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, periodicity_days } = req.body;
  
  db.prepare('UPDATE medical_tests SET name = ?, periodicity_days = ? WHERE id = ?')
    .run(name, periodicity_days, id);
  
  res.json({ success: true });
});

app.delete('/medical-tests/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM employee_medical_tests WHERE medical_test_id = ?').run(id);
  db.prepare('DELETE FROM medical_tests WHERE id = ?').run(id);
  res.json({ success: true });
});

// ============= EMPLOYEE MEDICAL TESTS =============

app.get('/employee-medical-tests', authenticateToken, (req, res) => {
  const { employee_id } = req.query;
  
  let query = `
    SELECT emt.*, mt.name as test_name, mt.periodicity_days, e.name as employee_name
    FROM employee_medical_tests emt
    JOIN medical_tests mt ON emt.medical_test_id = mt.id
    JOIN employees e ON emt.employee_id = e.id
  `;
  
  if (employee_id) {
    if (req.user.role !== 'super_admin') {
      const emp = db.prepare(`
        SELECT e.pizzeria_id, p.franchisee_id
        FROM employees e
        JOIN pizzerias p ON e.pizzeria_id = p.id
        WHERE e.id = ?
      `).get(employee_id);

      if (!emp) return res.status(404).json({ error: 'Сотрудник не найден' });

      if (req.user.role === 'franchisee' && emp.franchisee_id !== req.user.franchisee_id) {
        return res.status(403).json({ error: 'Доступ запрещён' });
      }

      if (req.user.role === 'manager') {
        const hasAccess = db.prepare(
          'SELECT 1 FROM pizzeria_managers WHERE manager_id = ? AND pizzeria_id = ?'
        ).get(req.user.id, emp.pizzeria_id);
        if (!hasAccess) return res.status(403).json({ error: 'Доступ запрещён' });
      }
    }

    query += ' WHERE emt.employee_id = ?';
    const tests = db.prepare(query).all(employee_id);
    return res.json(tests);
  }
  
  if (req.user.role === 'franchisee') {
    query += ` WHERE e.pizzeria_id IN (
      SELECT id FROM pizzerias WHERE franchisee_id = ?
    )`;
    const tests = db.prepare(query).all(req.user.franchisee_id);
    return res.json(tests);
  }
  
  if (req.user.role === 'manager') {
    query += ` WHERE e.pizzeria_id IN (
      SELECT pizzeria_id FROM pizzeria_managers WHERE manager_id = ?
    )`;
    const tests = db.prepare(query).all(req.user.id);
    return res.json(tests);
  }
  
  const tests = db.prepare(query).all();
  res.json(tests);
});

app.post('/employee-medical-tests/bulk', authenticateToken, (req, res) => {
  const { employee_id, tests } = req.body;
  
  const stmt = db.prepare(
    'INSERT INTO employee_medical_tests (employee_id, medical_test_id, expiry_date, created_by) VALUES (?, ?, ?, ?)'
  );
  
  tests.forEach(test => {
    stmt.run(employee_id, test.medical_test_id, test.expiry_date, req.user.id);
  });
  
  res.json({ success: true });
});

app.delete('/employee-medical-tests/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM employee_medical_tests WHERE id = ?').run(id);
  res.json({ success: true });
});

app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
