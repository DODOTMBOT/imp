# Architecture — Dodo Pizza Territory Management Platform

## Обзор

Full-stack веб-приложение для управления франшизами Dodo Pizza. Позволяет отслеживать пиццерии, сотрудников, управляющих и медицинские книжки.

**Стек:** React 19 + TypeScript (frontend) · Node.js + Express 5 + SQLite (backend) · JWT-аутентификация

---

## Структура папок

```
/Desktop/IMP/
├── backend/
│   ├── server.js          # Точка входа — все роуты, middleware (542 строки)
│   ├── migrations.js      # Инициализация схемы БД
│   ├── seed-new.js        # Тестовые данные (создаёт пользователей и пиццерии)
│   ├── seed.js            # Устаревший seed
│   ├── database.js        # Устаревшая инициализация БД (частично используется)
│   ├── fix-delete.js      # Утилита-патч для роута удаления менеджера
│   ├── dodo.db            # SQLite база данных (в .gitignore)
│   └── package.json
│
└── frontend/
    └── src/
        ├── main.tsx                  # Точка входа React
        ├── App.tsx                   # BrowserRouter + защищённые роуты
        ├── contexts/
        │   └── AuthContext.tsx       # Глобальный стейт авторизации (Context + localStorage)
        ├── services/
        │   └── api.ts                # Axios-клиент + все API-функции
        ├── types/
        │   └── index.ts              # TypeScript интерфейсы
        ├── utils/
        │   └── medbook.ts            # Хелперы статуса медкнижки
        ├── hooks/                    # Хуки для получения данных с API
        │   ├── useStats.ts
        │   ├── useFranchisees.ts
        │   ├── usePizzerias.ts
        │   ├── useManagers.ts
        │   ├── useEmployees.ts
        │   ├── useMedicalTests.ts
        │   └── useEmployeeMedicalTests.ts
        ├── pages/                    # Страницы (соответствуют роутам)
        │   ├── Login.tsx             # /login
        │   ├── Overview.tsx          # /
        │   ├── Admin.tsx             # /admin (только super_admin)
        │   ├── Locations.tsx         # /locations
        │   ├── Employees.tsx         # /employees
        │   ├── HealthCompliance.tsx  # /health
        │   ├── Settings.tsx          # /settings (super_admin, franchisee)
        │   ├── Staffing.tsx          # /staffing (placeholder)
        │   └── Metrics.tsx           # /metrics (placeholder)
        └── components/
            ├── Modal.tsx             # Обёртка для модалок (Framer Motion)
            ├── Sidebar.tsx           # Навигационный сайдбар (роль-зависимый)
            ├── StatCard.tsx          # Карточка со статистикой
            ├── StatusBadge.tsx       # Бейдж статуса медкнижки
            ├── admin/
            │   ├── FranchiseeCard.tsx   # Карточка франчайзи с пиццериями/менеджерами
            │   ├── FranchiseeForm.tsx   # Форма создания/редактирования франчайзи
            │   ├── ManagerForm.tsx      # Форма менеджера + выбор пиццерий
            │   └── PizzeriaForm.tsx     # Форма пиццерии
            ├── employees/
            │   └── EmployeeForm.tsx     # Форма сотрудника
            ├── health/
            │   └── MedicalBookForm.tsx  # Массовое назначение анализов сотруднику
            └── settings/
                └── MedicalTestForm.tsx  # Форма шаблона медицинского анализа
```

---

## Схема базы данных

### Таблица `users`
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | INTEGER PK | |
| email | TEXT UNIQUE NOT NULL | |
| password_hash | TEXT NOT NULL | SHA256 (небезопасно, нужен bcrypt) |
| role | TEXT NOT NULL | `super_admin` / `franchisee` / `manager` |
| name | TEXT NOT NULL | |
| franchisee_id | INTEGER | FK → franchisees.id (только для franchisee/manager) |

### Таблица `franchisees`
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| user_id | INTEGER UNIQUE NOT NULL | FK → users.id (аккаунт владельца) |
| created_by | INTEGER | FK → users.id |

### Таблица `pizzerias`
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| address | TEXT | |
| franchisee_id | INTEGER NOT NULL | FK → franchisees.id |

### Таблица `pizzeria_managers` (junction)
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | INTEGER PK | |
| manager_id | INTEGER NOT NULL | FK → users.id |
| pizzeria_id | INTEGER NOT NULL | FK → pizzerias.id |

### Таблица `employees`
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| position | TEXT NOT NULL | Должность |
| pizzeria_id | INTEGER NOT NULL | FK → pizzerias.id |
| med_book_expiry | DATE | Срок действия медкнижки |
| created_by | INTEGER | FK → users.id |

### Таблица `medical_tests` (шаблоны анализов)
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | Название анализа (напр. "Флюорография") |
| periodicity_days | INTEGER NOT NULL | Периодичность в днях |
| franchisee_id | INTEGER NOT NULL | FK → franchisees.id |
| created_by | INTEGER NOT NULL | FK → users.id |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### Таблица `employee_medical_tests` (записи анализов)
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | INTEGER PK | |
| employee_id | INTEGER NOT NULL | FK → employees.id |
| medical_test_id | INTEGER NOT NULL | FK → medical_tests.id |
| expiry_date | DATE NOT NULL | Дата истечения конкретного анализа |
| created_by | INTEGER NOT NULL | FK → users.id |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### Таблица `weekly_metrics` (схема есть, роуты не реализованы)
| Колонка | Тип | Описание |
|---------|-----|----------|
| id | INTEGER PK | |
| pizzeria_id | INTEGER NOT NULL | FK → pizzerias.id |
| week_date | DATE NOT NULL | |
| revenue | DECIMAL(10,2) | |
| avg_check | DECIMAL(10,2) | |
| quality_score | DECIMAL(3,2) | |
| submitted_by | INTEGER | FK → users.id |

### Диаграмма связей (упрощённо)
```
users ─────────────────── franchisees (user_id)
  │                            │
  │ (franchisee_id)            │ (franchisee_id)
  ▼                            ▼
users (manager) ──── pizzeria_managers ──── pizzerias
                                                 │
                                            employees ──── employee_medical_tests
                                                                    │
                                            medical_tests ──────────┘
```

---

## API Endpoints

Base URL: `http://localhost:3000`

Все endpoints (кроме `/login`) требуют заголовок: `Authorization: Bearer <token>`

### Аутентификация

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| POST | `/login` | — | Вход по email/password, возвращает JWT (24ч) |
| POST | `/logout` | все | Выход (статeless — очищается на клиенте) |
| GET | `/me` | все | Информация о текущем пользователе |

### Франчайзи

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| GET | `/franchisees` | все | super_admin видит всех, franchisee — только себя |
| POST | `/franchisees` | super_admin | Создать франчайзи + аккаунт пользователя |
| PUT | `/franchisees/:id` | super_admin | Обновить имя/email |
| DELETE | `/franchisees/:id` | super_admin | Удалить + каскад (пиццерии, сотрудники, менеджеры) |

### Пиццерии

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| GET | `/pizzerias` | все | Фильтрация по роли; `?franchisee_id=` для super_admin |
| POST | `/pizzerias` | все | Создать пиццерию |
| PUT | `/pizzerias/:id` | все | Обновить (name, address) |
| DELETE | `/pizzerias/:id` | все | Удалить + каскад (сотрудники, связи с менеджерами) |

### Управляющие

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| GET | `/managers` | все | `?franchisee_id=` для фильтрации |
| GET | `/managers/:id/pizzerias` | все | Пиццерии, закреплённые за менеджером |
| POST | `/managers` | все | Создать менеджера + привязать к пиццериям |
| PUT | `/managers/:id` | все | Обновить + перезаписать привязки к пиццериям |
| DELETE | `/managers/:id` | все | Удалить менеджера и его привязки |

### Сотрудники

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| GET | `/employees` | все | Фильтрация по роли; `?pizzeria_id=`, `?franchisee_id=` |
| POST | `/employees` | все | Создать сотрудника |
| PUT | `/employees/:id` | все | Обновить (name, position, med_book_expiry) |
| DELETE | `/employees/:id` | все | Удалить сотрудника |

### Статистика

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| GET | `/stats` | все | pizzeriaCount, employeeCount, healthAlerts, avgStaffing |

### Шаблоны медицинских анализов

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| GET | `/medical-tests` | все | Шаблоны, отфильтрованные по franchisee |
| POST | `/medical-tests` | все | Создать шаблон анализа |
| PUT | `/medical-tests/:id` | все | Обновить шаблон |
| DELETE | `/medical-tests/:id` | все | Удалить шаблон + все записи у сотрудников |

### Записи анализов сотрудников

| Метод | Путь | Роли | Описание |
|-------|------|------|----------|
| GET | `/employee-medical-tests` | все | `?employee_id=` для конкретного сотрудника |
| POST | `/employee-medical-tests/bulk` | все | Массово назначить анализы сотруднику |
| DELETE | `/employee-medical-tests/:id` | все | Удалить запись |

---

## Frontend — Страницы и роуты

| Страница | Роут | Файл | Доступ | Описание |
|----------|------|------|--------|----------|
| Login | `/login` | pages/Login.tsx | Публичный | Форма входа |
| Overview | `/` | pages/Overview.tsx | Все | Дашборд: 4 карточки со статистикой |
| Admin | `/admin` | pages/Admin.tsx | super_admin | CRUD франчайзи, пиццерий, менеджеров |
| Locations | `/locations` | pages/Locations.tsx | Все | Список всех пиццерий |
| Employees | `/employees` | pages/Employees.tsx | Все | Таблица сотрудников; редактирование для super_admin/franchisee |
| Health | `/health` | pages/HealthCompliance.tsx | Все | Медицинские книжки с цветовыми статусами |
| Settings | `/settings` | pages/Settings.tsx | super_admin, franchisee | CRUD шаблонов медицинских анализов |
| Staffing | `/staffing` | pages/Staffing.tsx | Все | Placeholder |
| Metrics | `/metrics` | pages/Metrics.tsx | Все | Placeholder |

---

## Роли пользователей и права доступа

| Функция | super_admin | franchisee | manager |
|---------|:-----------:|:----------:|:-------:|
| Создавать франчайзи | ✅ | ❌ | ❌ |
| Видеть всех франчайзи | ✅ | ❌ (только себя) | ❌ |
| CRUD пиццерий | ✅ | ✅ (своих) | ❌ |
| Создавать менеджеров | ✅ | ✅ | ❌ |
| Видеть сотрудников | ✅ (все) | ✅ (своих) | ✅ (своих пиццерий) |
| Редактировать сотрудников | ✅ | ✅ | ❌ |
| Шаблоны анализов | ✅ | ✅ (своих) | ❌ |
| Назначать анализы сотрудникам | ✅ | ✅ | ✅ |
| Панель /admin | ✅ | ❌ | ❌ |
| Раздел /settings | ✅ | ✅ | ❌ |

---

## Библиотеки и зависимости

### Backend
| Пакет | Версия | Назначение |
|-------|--------|-----------|
| express | ^5.2.1 | Web-фреймворк |
| better-sqlite3 | ^12.9.0 | Синхронный SQLite-драйвер |
| jsonwebtoken | ^9.0.3 | JWT |
| cors | ^2.8.6 | CORS-middleware |
| dotenv | ^17.4.2 | Переменные окружения (не используется!) |
| pg | ^8.20.0 | PostgreSQL (не используется!) |

### Frontend
| Пакет | Версия | Назначение |
|-------|--------|-----------|
| react | ^19.2.5 | UI-фреймворк |
| react-router-dom | ^7.14.2 | Роутинг |
| axios | ^1.15.2 | HTTP-клиент |
| tailwindcss | ^3.4.1 | CSS-утилиты |
| framer-motion | ^12.38.0 | Анимации |
| lucide-react | ^1.8.0 | Иконки |
