MAKEFLAGS += --no-print-directory
-include .env
export

DOCKER_DIR = ./server/

start-db:
	@cd "${DOCKER_DIR}" && sudo -E docker compose up -d
	@until sudo -E docker compose exec -T $(DB_SERVICE) pg_isready -U $(PG_USER) >/dev/null 2>&1; do \
		sleep 0.5; \
		done

stop-db:
	@sudo docker compose down

remove-db-volume:
	@sudo docker volume rm server_pg5-data

import-data:
	@node import_data_from_csv.js

run-db:
	@$(MAKE) start-db
	@$(MAKE) import-data

remove:
	@$(MAKE) stop-db
	@$(MAKE) remove-db-volume

start-backend:
	@node --watch ./server/index.js