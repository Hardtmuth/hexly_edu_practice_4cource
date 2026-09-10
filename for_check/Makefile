MAKEFLAGS += --no-print-directory
-include .env
export

start-db:
	@sudo docker compose up -d
	@until sudo docker compose exec -T $(DB_SERVICE) pg_isready -U $(PG_USER) >/dev/null 2>&1; do \
		sleep 0.5; \
		done

stop-db:
	@sudo docker compose down

remove-db-volume:
	@sudo docker volume rm for_check_pg-data

import-data:
	@node add_data.mjs

run-queries:
	@sudo docker compose exec -T $(DB_SERVICE) psql -U $(PG_USER) -d $(PG_DB) < queries.sql

run:
	@$(MAKE) start-db
	@$(MAKE) import-data
	@$(MAKE) run-queries
	@$(MAKE) stop-db
	@$(MAKE) remove-db-volume