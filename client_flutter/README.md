## Мини-бронирование (Flutter)

### Требования

- установлен **Flutter SDK**
- для Windows desktop: включён таргет `windows`

Проверка:

```bash
flutter --version
flutter devices
```

### GraphQL URL

По умолчанию используется `http://localhost:3000/graphql`.

Можно переопределить так:

```bash
flutter run --dart-define=GRAPHQL_URL=http://localhost:3000/graphql
```

Для Android emulator обычно нужен `http://10.0.2.2:3000/graphql`.

### Запуск

Если у тебя ещё нет платформенных папок (android/ios/windows/…), создай их:

```bash
flutter create .
```

Далее:

```bash
flutter pub get
flutter run
```

Windows:

```bash
flutter run -d windows
```
