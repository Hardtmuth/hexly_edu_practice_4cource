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
	@sudo docker volume rm 51etl3nf_pg5-data

import-data:
	@node import_data_from_csv.js

run-db:
	@$(MAKE) start-db
	@$(MAKE) import-data

remove:
	@$(MAKE) stop-db
	@$(MAKE) remove-db-volume