## Требования (Prerequisites)

Перед запуском убедитесь, что у вас установлены:

  * **Docker & Docker Compose**
  * **Node.js** (версия 22+)
  * **postgresql-client** (psql — для локального подключения к БД)
  * **Make** (для использования быстрых команд из Makefile)

## Настройка окружения (.env)

Перед запуском проекта создайте в директории файл `.env`:

```env
PG_PORT=5438
PG_USER=postgres
PG_PASS=password
PG_DB=practice5
DB_SERVICE=postgres
```

## Запуск БД

Вы можете запустить БД и импротировать данные одной командой с помощью `make`:
```bash
make run-db
```