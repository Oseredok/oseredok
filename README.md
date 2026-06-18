# Oseredok

[![codecov](https://codecov.io/gh/Oseredok/oseredok/branch/main/graph/badge.svg?token=50857a63-7fc4-4663-9ee7-767cc857b6c1)](https://codecov.io/gh/Oseredok/oseredok?token=50857a63-7fc4-4663-9ee7-767cc857b6c1)

# Агрегатор студентських організацій НаУКМА
Платформа для пошуку студентських організацій та реєстрації на події.

## Учасники
- Дем'янік Катерина
- Сич Анастасія
- Вікторія Рахманова
- Кривич Вероніка

## Стек
- Frontend: React + Vite
- Backend: Python + FastAPI
- БД: MySQL

## Запуск (буде доповнено)
Детальна інструкція по запуску буде додана після налаштування середовища.


## Лінк на Kanban - дошку : 
- https://sharing.clickup.com/90151427240/b/h/6-901523495375-2/cdd9136ae826d64

##  Канали звʼязку: 
- Telegram - чат
- Teams - канал: 
https://teams.microsoft.com/l/channel/19%3A8-ORD-ZbJA6oaPOudXHKJEjqDUr1jy3tV1lfsbOeSsE1%40thread.tacv2/%D0%9A%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%B0%2002.%20%D0%9E%D1%81%D0%B5%D1%80%D0%B5%D0%B4%D0%BE%D0%BA?groupId=3db2dbbd-f337-494e-89d8-fd4abe0c5859&tenantId=b8cbfe43-c90c-4bea-84ae-be5d6d8a5f52&ngc=true

 
##  Структура проєкту
 
```
Осередок/
├── backend/          # FastAPI сервер
│   ├── main.py       # Роути API
│   ├── models.py     # SQLAlchemy моделі
│   ├── schemas.py    # Pydantic схеми
│   ├── database.py   # Підключення до БД
│   ├── requirements.txt
│   └── .env.example
├── frontend/         # React + Vite застосунок
│   ├── src/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── db/
│   └── init.sql      # SQL-скрипт ініціалізації БД
└── requirements.txt  # Повний список залежностей
```
 
---
 
##  Вимоги
 
- **Python** ≥ 3.10
- **Node.js** ≥ 18
- **MySQL** ≥ 8.0 
---
 
## Запуск проєкту
 
### 1. Клонування репозиторію
 
```bash
git clone <URL репозиторію>
cd Осередок
```
 
---
 
### 2. Налаштування бази даних (MySQL)
 
#### локальний MySQL
 
Увійдіть у MySQL і виконайте скрипт ініціалізації:
 
```bash
mysql -u root -p < db/init.sql
```
 
 
### 3. Запуск бекенду (FastAPI)
 
#### 3.1. Перейдіть у папку `backend`
 
```bash
cd backend
```
 
#### 3.2. Створіть і активуйте віртуальне середовище
 
```bash
# macOS / Linux
python3 -m venv venv
source venv/bin/activate
 
# Windows
python -m venv venv
venv\Scripts\activate
```
 
#### 3.3. Встановіть залежності
 
> Використовуйте `requirements.txt` з кореня проєкту — він містить усі потрібні пакети (`passlib[bcrypt]`, `email-validator`).
 
```bash
pip install -r ../requirements.txt
```
 
#### 3.4. Налаштуйте змінні середовища
 
Скопіюйте приклад і заповніть своїми даними:
 
```bash
cp .env.example .env
```
 
Відредагуйте `.env`:
 
```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/student_orgs
```
 
#### 3.5. Запустіть сервер
 
```bash
uvicorn main:app --reload
```
 
Бекенд буде доступний за адресою: **http://127.0.0.1:8000**
 
Інтерактивна документація API: **http://127.0.0.1:8000/docs**
 
---
 
### 4. Запуск фронтенду (React + Vite)
 
Відкрийте **новий термінал** і перейдіть у папку `frontend`:
 
```bash
cd frontend
```
 
#### 4.1. Встановіть залежності Node.js
 
```bash
npm install
```
 
#### 4.2. Запустіть dev-сервер
 
```bash
npm run dev
```
 
Фронтенд буде доступний за адресою: **http://localhost:5173**
 
---
 