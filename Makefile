.PHONY: dev prod stop migrate seed logs clean shell-back shell-db

dev:
	docker compose up -d

prod:
	docker compose -f docker-compose.prod.yml up -d --build

stop:
	docker compose down

migrate:
	docker compose exec backend alembic upgrade head

seed:
	docker compose exec backend python -m app.seed

logs:
	docker compose logs -f --tail=50

logs-back:
	docker compose logs -f --tail=50 backend

logs-front:
	docker compose logs -f --tail=50 frontend

clean:
	docker compose down -v --remove-orphans

shell-back:
	docker compose exec backend bash

shell-db:
	docker compose exec postgres psql -U postgres -d aibc

restart:
	docker compose restart

build:
	docker compose up -d --build
