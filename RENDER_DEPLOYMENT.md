# Розгортання на Render

## Швидкий старт

### 1. Підготовка репозиторію

```bash
# Переконайтеся, що код закомічений в Git
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Налаштування на Render

#### Варіант A: Automatic (Рекомендується)

1. Відіть на https://render.com
2. Натисніть **New** → **Blueprint**
3. Виберіть **Public Git repository**
4. Вкажіть URL вашого GitHub репозиторію
5. Виберіть гілку `main`
6. Render автоматично прочитає `render.yaml` і розгорне обидва сервісу

#### Варіант B: Manual

**Розгортання Backend:**

1. Натисніть **New** → **Web Service**
2. Виберіть ваш GitHub репозиторій
3. Налаштування:
   - **Name**: `histology-portal-api`
   - **Runtime**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free

4. **Environment Variables** (добавити):
   ```
   NODE_ENV=production
   JWT_SECRET=<generate random 32+ char string>
   DATABASE_URL=<буде додана після створення БД>
   ```

5. При створенні, додайте **PostgreSQL Database**:
   - На сторінці хоста, натисніть **+ Create** → **PostgreSQL**
   - **Name**: `histology-db`
   - **Plan**: Free

**Розгортання Frontend:**

1. Натисніть **New** → **Static Site**
2. Налаштування:
   - **Name**: `histology-portal-web`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

### 3. Налаштування домену

- На Render, йдіть на Settings вашого хоста
- Додайте **Custom Domain** (опціонально)
- Налаштуйте DNS записи (якщо потрібно)

### 4. Дані в базі

После першого розгортання, БД буде пуста. Щоб додати тестові дані:

```bash
# Локально (з PostgreSQL додатків збережені)
npm run seed

# Або вручну через Render console:
# 1. Йдіть на Database Settings
# 2. Натисніть "Connect" → "External"
# 3. Скопіюйте DATABASE_URL
# 4. Локально: psql <DATABASE_URL> < db/seed.sql
```

## Моніторинг і Логи

- **Logs**: На сторінці сервісу, вкладка **Logs**
- **Metrics**: Вкладка **Metrics** (CPU, Memory, Requests)

## Обновлення код

Просто commit + push в GitHub, Render автоматично перестворить сервіс.

## Проблеми

### База даних підключується з помилкою

- Перевірте `DATABASE_URL` в Environment Variables
- Упевніться, що БД створена на Render
- Перезавантажте сервіс

### CORS помилки

- Перевірте `CORS_ORIGIN` в `server/index.js`
- Додайте URL вашого фронтенду в список `allowedOrigins`

### Завантаження файлів не працює

- На Render, файли можуть не зберігатися навічно
- Використовуйте зовнішній storage (AWS S3, Cloudinary тощо)

---

**Backend**: `https://your-api.onrender.com`  
**Frontend**: `https://your-web.onrender.com`
