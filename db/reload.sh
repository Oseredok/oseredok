#!/bin/bash
# Повне перезавантаження БД видаляє старі дані і заливає тестові з init.sql
# Використання: ./db/reload.sh


set -e
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Видаляю базу student_orgs..."
mysql -u root -e "DROP DATABASE IF EXISTS student_orgs;"

echo "Створюю базу і заливаю тестові дані..."
mysql -u root < "$DIR/init.sql"

echo "Готово:"
mysql -u root student_orgs -e "
  SELECT COUNT(*) AS organizations FROM organizations;
  SELECT COUNT(*) AS users FROM users;
  SELECT COUNT(*) AS events FROM events;
"
