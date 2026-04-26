# TODO — Dodo Pizza Territory Management Platform

## ✅ Реализовано

### Backend
- [x] JWT-аутентификация (login, logout, /me)
- [x] Middleware `authenticateToken` на всех защищённых роутах
- [x] CRUD франчайзи (с созданием аккаунта пользователя)
- [x] CRUD пиццерий
- [x] CRUD управляющих + привязка к пиццериям (many-to-many)
- [x] CRUD сотрудников
- [x] CRUD шаблонов медицинских анализов (`medical_tests`)
- [x] Массовое назначение анализов сотруднику (`/employee-medical-tests/bulk`)
- [x] Удаление записей анализов
- [x] Role-based фильтрация данных (super_admin / franchisee / manager)
- [x] Каскадные удаления (ручные, без FK)
- [x] Endpoint статистики `/stats` (pizzeriaCount, employeeCount, healthAlerts)
- [x] Схема БД `weekly_metrics` (таблица создана)

### Frontend
- [x] Страница входа `/login`
- [x] Защищённые роуты (redirect на /login если не авторизован)
- [x] Дашборд `/` со статистикой
- [x] Панель администратора `/admin` (только super_admin)
- [x] Список пиццерий `/locations`
- [x] Управление сотрудниками `/employees`
- [x] Медицинские книжки `/health` (цветовые статусы: expired / expiring / valid)
- [x] Настройки шаблонов анализов `/settings`
- [x] Динамический сайдбар (навигация по ролям)
- [x] AuthContext + localStorage для хранения токена
- [x] Axios-клиент с автоматическим заголовком Authorization
- [x] 7 кастомных хуков для работы с API
- [x] Все формы: FranchiseeForm, PizzeriaForm, ManagerForm, EmployeeForm, MedicalTestForm, MedicalBookForm
- [x] Анимированные модалки (Framer Motion)

---

## 🚧 В процессе / Требует доработки

- [ ] Страница `/staffing` — создана, но показывает только "Coming soon"
- [ ] Страница `/metrics` — создана, но показывает только "Coming soon"
- [ ] `avgStaffing` в `/stats` захардкожено как `87` (не считается реально)
- [ ] `dotenv` установлен, но не подключён и не используется
- [ ] `pg` (PostgreSQL) установлен, но не используется

---

## 📋 Планируется

### Высокий приоритет (безопасность — см. SECURITY.md)
- [ ] Перенести JWT_SECRET в `.env` файл
- [ ] Заменить SHA256 на bcrypt для хэширования паролей
- [ ] Ограничить CORS до конкретных origins
- [ ] Добавить rate limiting на `/login`

### Функциональность
- [ ] Страница Staffing — управление расписанием/сменами сотрудников
- [ ] Страница Metrics — дашборд бизнес-метрик (выручка, средний чек, качество)
- [ ] API роуты для `weekly_metrics` (схема БД готова, нужны CRUD endpoints)
- [ ] Реальный расчёт `avgStaffing` в /stats
- [ ] Редактирование существующих записей анализов (сейчас только создание + удаление)
- [ ] Фильтрация и поиск в таблице сотрудников
- [ ] Пагинация для больших списков

### Технический долг
- [ ] Подключить `dotenv` в `backend/server.js`
- [ ] Удалить неиспользуемую зависимость `pg`
- [ ] Включить `foreign_keys = ON` (сначала проверить данные в БД)
- [ ] Добавить валидацию входных данных на backend
- [ ] Разбить `server.js` на роутеры (сейчас 542 строки в одном файле)
- [ ] Добавить обработку ошибок для неожиданных сбоев БД
- [ ] Написать .env.example файл

### Production
- [ ] Настроить nginx как reverse proxy
- [ ] Настроить HTTPS/SSL
- [ ] Настроить process manager (PM2)
- [ ] Добавить логирование запросов (morgan или winston)
- [ ] Настроить бэкапы SQLite (или мигрировать на PostgreSQL)

---

## 🔴 Критические баги

### BUG-001: Удаление сотрудника не удаляет его анализы
**Файл:** `backend/server.js:358-362`
```javascript
app.delete('/employees/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM employees WHERE id = ?').run(id); // <- orphaned записи в employee_medical_tests!
  res.json({ success: true });
});
```
**Эффект:** Записи в `employee_medical_tests` остаются после удаления сотрудника.  
**Исправление:** Добавить `db.prepare('DELETE FROM employee_medical_tests WHERE employee_id = ?').run(id);` перед удалением сотрудника.

---

### BUG-002: JWT_SECRET захардкожен
**Файл:** `backend/server.js:9`  
**Эффект:** Компрометация кода = компрометация всех токенов.  
**Исправление:** см. SECURITY.md раздел 1.

---

### BUG-003: SHA256 для паролей
**Файлы:** `backend/server.js:40`, `backend/seed-new.js`  
**Эффект:** Пароли уязвимы к brute-force и rainbow table атакам.  
**Исправление:** см. SECURITY.md раздел 2.

---

### BUG-004: avgStaffing захардкожен
**Файл:** `backend/server.js` (в `/stats` endpoint)
```javascript
res.json({
  pizzeriaCount,
  employeeCount,
  healthAlerts,
  avgStaffing: 87  // <- всегда 87, не считается
});
```
**Эффект:** Показатель на дашборде не отражает реальных данных.

---

### BUG-005: Нет проверки ownership при создании/обновлении пиццерий
**Файл:** `backend/server.js:202-224`  
**Эффект:** Franchisee может создать пиццерию с `franchisee_id` другого франчайзи.  
**Исправление:** При `role === 'franchisee'` принудительно использовать `req.user.franchisee_id`.
