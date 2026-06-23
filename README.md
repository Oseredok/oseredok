# Oseredok

[![codecov](https://codecov.io/gh/Oseredok/oseredok/branch/main/graph/badge.svg?token=50857a63-7fc4-4663-9ee7-767cc857b6c1)](https://codecov.io/gh/Oseredok/oseredok?token=50857a63-7fc4-4663-9ee7-767cc857b6c1)

# Агрегатор студентських організацій НаУКМА
Платформа для пошуку студентських організацій та реєстрації на події.

## Учасники
- Дем'янік Катерина
- Сич Анастасія
- Вікторія Рахманова

## Стек
- Frontend: React + Vite
- Backend: Python + FastAPI
- БД: MySQL

## Архітектура
```
┌──────────────────┐
│   React (Vite)   │  ← фронтенд
└────────┬─────────┘
         │ HTTP
         ▼
┌──────────────────┐
│  FastAPI Router  │  ← обробка запитів
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Бізнес-логіка   │  ← ролі, JWT, валідація
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  SQLAlchemy ORM  │  ← read / write
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  MySQL (локально)│  ← база даних
└──────────────────┘
```

## Лінк на Kanban - дошку : 
- https://sharing.clickup.com/90151427240/b/h/6-901523495375-2/cdd9136ae826d64

##  Канали звʼязку: 
- Telegram - чат
- Teams - канал: 
https://teams.microsoft.com/l/channel/19%3A8-ORD-ZbJA6oaPOudXHKJEjqDUr1jy3tV1lfsbOeSsE1%40thread.tacv2/%D0%9A%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%B0%2002.%20%D0%9E%D1%81%D0%B5%D1%80%D0%B5%D0%B4%D0%BE%D0%BA?groupId=3db2dbbd-f337-494e-89d8-fd4abe0c5859&tenantId=b8cbfe43-c90c-4bea-84ae-be5d6d8a5f52&ngc=true

 
##  Структура проєкту

```
Осередок/
├── .github/                    # Налаштування GitHub (CI/CD, workflows)
├── backend/                    # FastAPI сервер
│   ├── tests/                  # Автотести бекенду
│   │   ├── conftest.py         
│   │   ├── test_helpers.py     
│   │   ├── test_main.py        
│   │   ├── test_roles.py       
│   │   └── test_schemas.py     
│   ├── .coveragerc             # Налаштування звіту покриття тестами
│   ├── database.py             # Підключення до БД
│   ├── main.py                 # Роути API
│   ├── models.py               # SQLAlchemy моделі таблиць
│   ├── pytest.ini              # Налаштування pytest
│   ├── requirements.txt        # Python-залежності
│   ├── roles.py                # Логіка ролей і прав доступу
│   └── schemas.py              # Pydantic схеми запитів/відповідей
├── frontend/                   # React + Vite застосунок
│   ├── src/
│   │   ├── assets/             # Статичні ресурси (зображення, іконки)
│   │   ├── components/         # Перевикористовувані UI-компоненти
│   │   │   ├── admin/          # Компоненти адмін-панелі
│   │   │   │   ├── AdminIcons.jsx
│   │   │   │   └── OrganizationFormFields.jsx
│   │   │   ├── cards/          # Картки для відображення сутностей
│   │   │   │   ├── EventCard.jsx
│   │   │   │   ├── OrgCard.jsx
│   │   │   │   └── SkeletonCard.jsx 
│   │   │   ├── ui/             # Базові UI-примітиви
│   │   │   ├── CategoryPill.jsx         
│   │   │   ├── EventRegistrationModal.jsx 
│   │   │   ├── Field.jsx                 
│   │   │   ├── FilterDropdown.jsx        
│   │   │   ├── LogoUploadField.jsx       
│   │   │   ├── Modal.jsx                
│   │   │   ├── Navbar.jsx               
│   │   │   └── SearchField.jsx          
│   │   ├── context/
│   │   │   └── ToastContext.jsx   # Глобальний контекст toast-сповіщень
│   │   ├── data/
│   │   │   └── mockEvents.js      # Тимчасові моковані дані подій
│   │   ├── hooks/                 # Кастомні React-хуки
│   │   │   ├── useCount.js
│   │   │   └── useDebounce.js     
│   │   ├── pages/                 # Сторінки застосунку
│   │   │   ├── AdminOrgEditPage.jsx      
│   │   │   ├── AdminPage.jsx            
│   │   │   ├── AdminUsersPage.jsx       
│   │   │   ├── CreateEventPage.jsx       
│   │   │   ├── CreateOrganizationPage.jsx 
│   │   │   ├── EventDetailPage.jsx      
│   │   │   ├── EventsPage.jsx            
│   │   │   ├── HomePage.jsx              
│   │   │   ├── OrganizationsPage.jsx     
│   │   │   ├── OrganizerPanelPage.jsx    
│   │   │   ├── OrgDashboardPage.jsx      
│   │   │   ├── OrgDetailPage.jsx         
│   │   │   └── ProfilePage.jsx           
│   │   ├── styles/
│   │   │   └── global.css         # Глобальні стилі
│   │   ├── theme/
│   │   │   └── tokens.js          # Дизайн-токени (кольори, відступи тощо)
│   │   ├── utils/                 # Утиліти та допоміжні функції
│   │   │   ├── orgForm.js         
│   │   │   ├── orgForm.test.js    
│   │   │   ├── roles.js           
│   │   │   └── roles.test.js     
│   │   ├── api.js                 # Функції для запитів до бекенду
│   │   ├── App.css
│   │   ├── App.jsx                # Кореневий компонент, маршрутизація
│   │   ├── index.css
│   │   └── main.jsx               # Точка входу React-застосунку
│   ├── .gitignore
│   ├── eslint.config.js           # Налаштування ESLint
│   ├── index.html                 # HTML-шаблон (точка входу Vite)
│   ├── package-lock.json
│   ├── package.json               # Node.js залежності та скрипти
│   ├── README.md
│   └── vite.config.js             # Налаштування Vite
├── db/
│   ├── migrations/                # Інкрементальні міграції БД (накатуються автоматично при старті бекенду)
│   │   ├── 001_extend_schema.sql
│   │   ├── 002_add_faculty_to_users.sql
│   │   └── 003_logo_url_mediumtext.sql
│   ├── init.sql                   # SQL-скрипт ініціалізації БД (основний спосіб засіяти дані)
│   └── reload.sh                  # Перезаливає БД з нуля з init.sql
├── .env.example                   # Шаблон змінних середовища (копіювати в backend/.env)
├── .gitignore
├── codecov.yml                    # Налаштування Codecov (звіт покриття тестами)
├── Oseredok_Postman_Collection.json # Колекція Postman для тестування API
└── README.md                      # Документація проєкту
```

---
 
##  Вимоги
 
- **Python** ≥ 3.10
- **Node.js** ≥ 18
- **MySQL** ≥ 8.0 


---
 
## Запуск проєкту

### 1. Клонування репозиторію

Відкрийте термінал і виконайте команду - папка `oseredok` створюється автоматично, вручну її створювати не потрібно:

```bash
git clone https://github.com/Oseredok/oseredok.git
cd oseredok
```

---

### 2. Налаштування бази даних (MySQL)

Відкрийте **новий термінал** і перейдіть у папку проєкту:

```bash
cd oseredok
```

Видаліть стару базу (якщо була) і залийте нову з тестовими даними:

```bash
# macOS / Linux
mysql -u root -e "DROP DATABASE IF EXISTS student_orgs;"
mysql -u root --default-character-set=utf8mb4 < db/init.sql

# Windows (CMD) - якщо mysql не розпізнається, вкажіть повний шлях:
"C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql" -u root -p -e "DROP DATABASE IF EXISTS student_orgs;"
"C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql" -u root -p --default-character-set=utf8mb4 < db/init.sql
```
> **Примітка для Windows:** якщо команда `mysql` не розпізнається - вкажіть повний шлях до виконуваного файлу. Версія може відрізнятись (наприклад, `MySQL Server 8.0` або `9.7`) - перевірте яка у вас встановлена в `C:\Program Files\MySQL\`.
> Якщо MySQL встановлений з паролем - додайте `-p` після `-u root`, термінал запитає пароль.

> **Важливо:** обов'язково використовуйте `--default-character-set=utf8mb4` щоб кирилиця в даних відображалась коректно.

Перевірте що дані залились успішно:

```bash
# macOS / Linux
mysql -u root student_orgs -e "SELECT COUNT(*) AS organizations FROM organizations; SELECT COUNT(*) AS users FROM users; SELECT COUNT(*) AS events FROM events;"

# Windows
"C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql" -u root -p student_orgs -e "SELECT COUNT(*) AS organizations FROM organizations; SELECT COUNT(*) AS users FROM users; SELECT COUNT(*) AS events FROM events;"
```

Якщо бачите числа більше нуля - база готова.

Щоб перезалити базу з нуля в майбутньому (видалить усі дані і поверне тестовий набір):

```bash
# macOS / Linux
./db/reload.sh

# Windows - виконайте ці дві команди вручну:
"C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql" -u root -p -e "DROP DATABASE IF EXISTS student_orgs;"
"C:\Program Files\MySQL\MySQL Server 9.7\bin\mysql" -u root -p --default-character-set=utf8mb4 < db/init.sql
```

В базі вже є тестові користувачі:

| Email | Роль | Пароль |
|---|---|---|
| `admin@ukma.edu.ua` | admin | password123 |
| `o.lytvyn@ukma.edu.ua` | org_owner | password123 |
| `mykhailo@ukma.edu.ua` | student | password123 |

---

### 3. Запуск бекенду (FastAPI)

#### 3.1. Відкрийте новий термінал та перейдіть у папку `backend`

```bash
cd oseredok
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

Після активації на початку рядка терміналу має з'явитись `(venv)`.

#### 3.3. Встановіть залежності

```bash
pip install -r requirements.txt
```

#### 3.4. Налаштуйте змінні середовища

Скопіюйте приклад із кореня проєкту:
```bash
# macOS / Linux
cp ../.env.example .env

# Windows (CMD)
copy ..\.env.example .env
```


Відредагуйте `.env` - якщо MySQL встановлений **без пароля**:

```env
DATABASE_URL=mysql+pymysql://root@localhost/student_orgs
```

Якщо MySQL встановлений **з паролем** - додайте його після `root:`:

```env
DATABASE_URL=mysql+pymysql://root:ВАШ_ПАРОЛЬ@localhost/student_orgs
```

> **Примітка для Windows:** файл зручно відредагувати командою `notepad .env` або відкрити в VS Code. Переконайтесь що файл збережено після редагування (`Ctrl+S`). Якщо редактор не зберігає зміни - перезапишіть файл через термінал:
> ```
> echo DATABASE_URL=mysql+pymysql://root:ВАШ_ПАРОЛЬ@localhost/student_orgs> .env
> echo JWT_SECRET=your_secret_key_here>> .env
> echo PORT=3000>> .env
> ```

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
cd oseredok
cd frontend
npm install
npm run dev
```

Фронтенд буде доступний за адресою: **http://localhost:5173**
 
---
 
