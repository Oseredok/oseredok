# Oseredok

# Агрегатор студентських організацій НаУКМА
Платформа для пошуку студентських організацій та реєстрації на події.

## Учасники
- Дем'янік Катерина 
- Сич Анастасія
- Вікторія Рахманова
- Кривич Вероніка 

## Стек
- Frontend: 
- Backend: 
- БД: 


 
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
 