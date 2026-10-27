.PHONY: up build down logs ps rebuild install clean certs local-certs
.DEFAULT_GOAL := up

# Builds the images and runs everything in containers: shared services, every backend and frontend (home: localhost:3000)
up:
	docker compose up -d --build --remove-orphans

# Builds every image without starting containers
build:
	docker compose build

# Stops every container; data volumes stay
down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

# After dependency changes: the images bake node_modules in
rebuild:
	docker compose build --no-cache
	docker compose up -d --remove-orphans

# Server: HTTPS certificate for DOMAIN's app subdomains (DOMAIN, CERTBOT_EMAIL in ./.env), then reload nginx
certs:
	docker compose run --rm certbot
	docker compose exec nginx nginx -s reload

# Local HTTPS tests: self-signed certificate for *.$DOMAIN, e.g. localtest.me (browser warns once per subdomain)
local-certs:
	docker compose run --rm local-certs

install:
	pnpm install && pnpm build

# Everything installs and builds regenerate (run `make install` after)
clean:
	find . -type d \( -name node_modules -o -name dist -o -name .turbo -o -name .tanstack \) -prune -exec rm -rf {} +
	find . -name "*.tsbuildinfo" -delete
