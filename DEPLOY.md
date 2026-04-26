# Deploy — Dodo Pizza Territory Management Platform

## Локальный запуск

### Требования
- Node.js 18+
- npm 9+

### 1. Клонировать репозиторий

```bash
git clone https://github.com/DODOTMBOT/imp.git
cd imp
```

### 2. Настроить переменные окружения

Создать файл `backend/.env`:
```env
JWT_SECRET=замените-на-случайную-строку-64-символа
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
```

Сгенерировать секрет:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> Пока `dotenv` не подключён в `server.js`, JWT_SECRET всё ещё захардкожен.  
> После подключения dotenv этот файл будет иметь силу.

### 3. Установить зависимости backend

```bash
cd backend
npm install
```

### 4. Инициализировать базу данных

```bash
# Создать таблицы
node migrations.js

# Заполнить тестовыми данными (опционально)
node seed-new.js
```

### 5. Запустить backend

```bash
node server.js
# Сервер запустится на http://localhost:3000
```

### 6. Установить зависимости frontend

```bash
cd ../frontend
npm install
```

### 7. Запустить frontend

```bash
npm run dev
# Откроется на http://localhost:5173
```

---

## Тестовые учётные данные

После запуска `node seed-new.js` будут доступны:

| Роль | Email | Пароль | Описание |
|------|-------|--------|----------|
| super_admin | admin@dodo.local | admin123 | Полный доступ |
| franchisee | franchisee1@dodo.local | franchise123 | Франчайзи 1 |
| franchisee | franchisee2@dodo.local | franchise123 | Франчайзи 2 |
| manager | manager1@dodo.local | manager123 | Менеджер (2 пиццерии) |

---

## Переменные окружения

### Backend (`backend/.env`)

| Переменная | Обязательна | Пример | Описание |
|-----------|-------------|--------|----------|
| JWT_SECRET | Да | `abc123...` | Секрет для подписи JWT (64+ символа) |
| PORT | Нет | `3000` | Порт сервера (по умолчанию 3000) |
| ALLOWED_ORIGINS | Нет | `http://localhost:5173` | Разрешённые CORS-origins (через запятую) |

> На данный момент `dotenv` установлен, но не подключён в `server.js`. До подключения переменные не читаются.

---

## Production деплой

### Подготовка frontend

```bash
cd frontend
npm run build
# Создаётся папка frontend/dist/ со статическими файлами
```

### Вариант 1: Backend отдаёт статику (простой)

Добавить в `backend/server.js` после `app.use(express.json())`:
```javascript
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// В конце файла, после всех роутов:
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

Запустить:
```bash
node server.js
# Сайт доступен на http://your-server:3000
```

### Вариант 2: Nginx как reverse proxy (рекомендуется)

Конфиг `/etc/nginx/sites-available/dodo-imp`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend статика
    root /path/to/imp/frontend/dist;
    index index.html;

    # Все запросы к /api/ → backend
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # React SPA — все остальные пути → index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> Если используете nginx-вариант, нужно изменить BASE_URL в `frontend/src/services/api.ts` с `http://localhost:3000` на `/api`.

Активировать конфиг:
```bash
ln -s /etc/nginx/sites-available/dodo-imp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Process manager (PM2)

```bash
npm install -g pm2

# Запустить backend
cd /path/to/imp/backend
pm2 start server.js --name dodo-backend

# Автозапуск при перезагрузке сервера
pm2 startup
pm2 save
```

Управление:
```bash
pm2 status          # Статус
pm2 logs dodo-backend   # Логи
pm2 restart dodo-backend  # Перезапуск
```

### HTTPS (Let's Encrypt)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

---

## Требования к серверу

| Ресурс | Минимум | Рекомендуется |
|--------|---------|---------------|
| RAM | 512 MB | 1 GB |
| CPU | 1 vCPU | 2 vCPU |
| Диск | 5 GB | 20 GB |
| Node.js | 18+ | 20 LTS |
| ОС | Ubuntu 20.04+ | Ubuntu 22.04 LTS |

---

## Скрипты

| Команда | Директория | Описание |
|---------|-----------|---------|
| `node server.js` | backend/ | Запустить сервер |
| `node migrations.js` | backend/ | Создать таблицы в БД |
| `node seed-new.js` | backend/ | Заполнить тестовыми данными |
| `npm run dev` | frontend/ | Dev-сервер с hot reload |
| `npm run build` | frontend/ | Собрать production-сборку |
| `npm run lint` | frontend/ | Проверить TypeScript/ESLint |

---

## Возможная миграция на PostgreSQL

Зависимость `pg` уже установлена в `backend/package.json`. Для перехода с SQLite на PostgreSQL нужно:

1. Установить PostgreSQL сервер
2. Создать базу данных и пользователя
3. Заменить `better-sqlite3` на `pg` в `server.js`
4. Переписать синхронные вызовы БД на async/await (pg — асинхронный)
5. Обновить синтаксис запросов (SQLite vs PostgreSQL незначительно отличаются)
6. Обновить `migrations.js` под PostgreSQL типы данных

Переменные окружения для PostgreSQL:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dodo_imp
```

---

## Файловая структура после сборки

```
imp/
├── backend/
│   ├── server.js       # Запускать этим
│   ├── dodo.db         # SQLite (создаётся после node migrations.js)
│   ├── .env            # Создать вручную!
│   └── node_modules/
└── frontend/
    ├── dist/           # Production-сборка (после npm run build)
    └── node_modules/
```
