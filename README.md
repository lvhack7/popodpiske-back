# Popodpiske API

**Краткое описание проекта:**  
Данный проект представляет собой backend-сервис, созданный с использованием NestJS и Sequelize ORM c использованем Postgre SQL базы данных.

## Описание

В этом проекте реализована архитектура REST API с использованием NestJS. Проект включает:
- Аутентификацию и авторизацию пользователей
- Подписки, Ссылки, СМС, Курсы, Платежы
- Админ возможности
- Документацию API через Swagger
- Интеграцию с базой данных PostgreSQL через Sequelize

## Предпосылки

Перед запуском убедитесь, что у вас установлены:
- [Node.js](https://nodejs.org/) (версия 22 или выше)
- [npm](https://www.npmjs.com/) (версия 10 или выше)

## Установка

1. **Клонируйте репозиторий:**

   ```bash
   git clone https://github.com/relitalkschool/popodpiske-api.git
   ```

2. **Перейдите в директорию проекта:**

   ```bash
   cd popodpiske-api
   ```

3. **Установите зависимости:**

   ```bash
   npm install
   ```

## Настройка окружения

Создайте в корневой папке проекта файл `.development.env` и настройте переменные окружения для разработки. Пример файла `.development.env`:

```env
DATABASE_HOST=localhost
DATABASE_NAME=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
PAYSAGE_API_KEY=...
PAYSAGE_SECRET_KEY=...
PAYSAGE_MERCHANT_ID=...
PAYSAGE_SERVICE_ID=...
PAYSAGE_MERCHANT_NAME=...
SMS_LOGIN=...
SMS_PASSWORD=...
SMS_SENDER=...
NODE_ENV=development
```

## Запуск проекта

### Режим разработки

Запустите приложение в режиме разработки:

```bash
npm run start:dev
```

Приложение будет доступно по адресу: [http://localhost:5002](http://localhost:5002)

### Продакшен сборка

1. Соберите проект:

   ```bash
   npm run build
   ```

2. Запустите собранное приложение (вам понадобится создать `.production.env` файл):

   ```bash
   npm run start:prod
   ```

## Документация API

Swagger документация доступна по адресу:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

**Для доступа к Swagger UI используйте следующие учетные данные:**

- **Логин:** admin  
- **Пароль:** popodpiskeDocs2025!

> **Примечание:** Для доступа к Swagger UI может быть настроена базовая авторизация или Bearer-токен (см. документацию проекта).

