.PHONY: up build down rebuild prod prod-down full full-down install clean
.DEFAULT_GOAL := up

DEV = docker compose -f docker-compose.dev.yml
PROD = docker compose -f docker-compose.prod.yml
FULL = docker compose -f docker-compose.full.yml

up: .env
	$(DEV) up -d --build --remove-orphans
	@echo "Open http://localhost:3000"

build: .env
	$(DEV) build

down:
	$(DEV) down

rebuild: .env
	$(DEV) build --no-cache
	$(DEV) up -d --remove-orphans --renew-anon-volumes

prod: .env
	$(PROD) up -d --build --remove-orphans

prod-down:
	$(PROD) down

full:
	$(FULL) up -d --build --remove-orphans
	@echo "Open http://localhost:3000"

full-down:
	$(FULL) down

.env:
	cp .env.example .env

install:
	pnpm install && pnpm build

clean:
	find . -type d \( -name node_modules -o -name dist -o -name .turbo -o -name .tanstack \) -prune -exec rm -rf {} +
	find . -name "*.tsbuildinfo" -delete
