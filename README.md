## Mini Booking (Backend + Web + Flutter)

Вертикальный срез мини-системы бронирования:

- **Backend**: Node.js + Apollo GraphQL + Sequelize + Postgres
- **Web**: React + TypeScript + Apollo Client
- **Flutter**: Mobile + Windows (лёгкий “виджет”-экран)

---

## Как это работает (коротко)

- **Сущности**: `Hotel` → `Room` → `Booking`
- **Даты**: строки формата `YYYY-MM-DD` (без времени)
- **Непересечение броней**: при создании брони backend проверяет пересечения по правилу:
  - конфликт, если есть активная бронь (`status=confirmed`) такая, что  
    `checkInDate < endDate` и `checkOutDate > startDate`
  - проверка выполняется **в транзакции** с блокировкой строки комнаты, чтобы не было гонок
- **Отмена**: `cancelBooking` переводит бронь в `status=cancelled` (и она больше не блокирует новые брони)

---

## Backend

### Запуск через Docker (как в ТЗ)

Нужен установленный Docker (проверка: `docker --version`).

```bash
docker compose up --build
```

Если видишь `docker: command not found` — установи Docker Desktop.

### Запуск без Docker (локально)

1. Подними локальный Postgres и создай БД (например `hotel`).
2. Создай `server/.env` по примеру `server/env_example`.
3. Запусти:

```bash
cd server
npm install
npm run db:migrate
npm run db:seed
npm start
```

### URLs

- **GraphQL / Playground**: `http://localhost:3000/graphql`
- **Health**: `http://localhost:3000/health`

---

## Web (React + TypeScript)

### Запуск

```bash
cd web
npm install
npm run dev
```

По умолчанию web использует backend `http://localhost:3000/graphql`.

Переопределение:

- создай `web/.env` по примеру `web/.env.example`
- укажи `VITE_GRAPHQL_URL`

---

## Flutter (Mobile + Windows)

Исходники: `client_flutter/`.

Нужен установленный Flutter SDK (проверка: `flutter --version`).

### Запуск

```bash
cd client_flutter
flutter create .
flutter pub get
flutter run
```

Windows:

```bash
flutter run -d windows
```

### GraphQL URL

По умолчанию: `http://localhost:3000/graphql`

Переопределение:

```bash
flutter run --dart-define=GRAPHQL_URL=http://localhost:3000/graphql
```

Android emulator обычно: `http://10.0.2.2:3000/graphql`
