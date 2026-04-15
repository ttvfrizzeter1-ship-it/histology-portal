# 🔬 Гістологія ПДМУ — Навчальний Портал v2.0

## 🚀 Запуск

```bash
# Термінал 1 — Сервер
cd server
npm install
node db/seed.js      # ← ОБОВ'ЯЗКОВО першого запуску
node index.js        # → http://localhost:3001

# Термінал 2 — Клієнт  
cd client
npm install
npm run dev          # → http://localhost:5173
```

## 👤 Акаунти викладачів (пароль: pdmu2024)

| Ім'я | Email |
|------|-------|
| Стецук Є.В. (Завідувач) | ye.stetsuk@pdmu.edu.ua |
| Шепітько В.І. (Проф.) | v.shepitko@pdmu.edu.ua |
| Борута Н.В. (Завуч) | n.boruta@pdmu.edu.ua |
| Пелипенко Л.Б. | l.pelypenko@pdmu.edu.ua |
| Вільхова О.В. | o.vilkhova@pdmu.edu.ua |
| Лисаченко О.Д. | o.lysachenko@pdmu.edu.ua |
| Волошина О.В. | o.voloshyna@pdmu.edu.ua |
| Рудь М.В. | m.rud@pdmu.edu.ua |
| Левченко О.А. | o.levchenko@pdmu.edu.ua |
| Штепа К.В. | k.shtepa@pdmu.edu.ua |
| Данилів О.Д. | o.danyliv@pdmu.edu.ua |

**Демо-студент:** student@pdmu.edu.ua / student123

## 🌐 Публічний доступ через ngrok

```bash
# Після запуску сервера на порту 3001:
npx ngrok http 3001

# Отримаєте URL: https://abc123.ngrok-free.app
# Скиньте це посилання будь-кому — відкриється одразу
```

> ⚠️ Клієнт (React) проксує /api → localhost:3001.
> Якщо хочете шерити і клієнт, запустіть 2 ngrok тунелі:
> ```
> npx ngrok http 3001   ← API
> npx ngrok http 5173   ← Frontend (скиньте це посилання)
> ```
> І у client/vite.config.js замініть proxy target на ngrok URL API.

## 📋 Що нового у v2.0

- ✅ **єАристо** — модулі: Презентація → Тест → Практичне завдання (фото)
- ✅ **Чат груп** — повідомлення між студентами та викладачем
- ✅ **Moodle посилання** — швидкий доступ до завдань
- ✅ **Управління групами** — викладач призначає студентів до груп
- ✅ **Реальні акаунти** викладачів кафедри (з файлу TEACHER_ACCOUNTS.md)
- ✅ **Реєстрація лише для студентів** — викладачі мають готові акаунти
- ✅ **Красиві діалоги** підтвердження видалення замість window.confirm
- ✅ **Сесія зберігається** при поверненні на головну сторінку
