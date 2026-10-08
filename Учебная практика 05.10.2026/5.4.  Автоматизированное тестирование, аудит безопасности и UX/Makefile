MAKEFLAGS += --no-print-directory
-include .env
export

DOCKER_DIR = ./server/container/

install:
	npm i

start-db:
	@cd "${DOCKER_DIR}" && sudo -E docker compose up -d
	@cd "${DOCKER_DIR}" && until sudo -E docker compose exec -T $(DB_SERVICE) pg_isready -U $(PG_USER)>/dev/null 2>&1; do \
		sleep 0.5; \
		done

stop-db:
	@cd "${DOCKER_DIR}" && sudo -E docker compose down

remove-db-volume:
	@cd "${DOCKER_DIR}" && sudo -E docker volume rm container_pg5-data

import-data:
	@node ./server/container/import_data_from_csv.js

run-db:
	@$(MAKE) start-db
	@$(MAKE) import-data

remove:
	@$(MAKE) stop-db
	@$(MAKE) remove-db-volume

start-backend:
	@node --watch ./server/index.js

start-frontend:
	@cd ./client && npx vite

test:
	@npx vitest --run --reporter=verbose