## Требования (Prerequisites)

Перед запуском убедитесь, что у вас установлены:

  * **Docker & Docker Compose**
  * **Node.js** (версия 22+)
  * **postgresql-client** (psql — для локального подключения к БД)
  * **Make** (для использования быстрых команд из Makefile)

## Настройка окружения (.env)

Перед запуском проекта создайте в директории файл `.env`:

```env
PG_PORT=5436
PG_DATA=/var/lib/postgresql/data
PG_USER=postgres
PG_PASS=password
PG_DB=practice
DB_SERVICE=postgres
```

## Быстрый старт (Quick Start)

Вы можете прогнать задания одной командой с помощью `make`:
```bash
make run
```