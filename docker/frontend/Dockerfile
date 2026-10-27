# One image definition for every web frontend in apps/ (React + Vite). Pick the app with the APP build arg
# (its package name) and the stage with `target`: `dev` (watch mode, used by docker-compose.yml) or `prod`. Build context: repo root.
#
#   docker build -f docker/frontend/Dockerfile --build-arg APP=@chat/home --target prod .
#
# Each app defines how it runs through its own package.json scripts: `dev`, `build` and `start`.
ARG NODE_IMAGE=node:20-alpine

FROM ${NODE_IMAGE} AS base
RUN corepack enable pnpm
ENV TURBO_TELEMETRY_DISABLED=1

# Every package.json plus the lockfile: the install below reruns only when dependencies change
FROM base AS manifests
WORKDIR /repo
COPY . .
RUN mkdir /out \
  && find . -name package.json -not -path "*/node_modules/*" | tar -cf - -T - | tar -xf - -C /out \
  && cp pnpm-lock.yaml pnpm-workspace.yaml /out/

# One install for the whole workspace, shared by every frontend image (APP is only set after it);
# the cache mount keeps downloaded packages between builds
FROM base AS deps
WORKDIR /repo
COPY --from=manifests /out/ .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --frozen-lockfile --store-dir /pnpm/store
COPY . .
# Shared packages (my-ui, frontend-common, ports, vite-config) built once here
RUN pnpm turbo run build --filter="./packages/*"

# Dev: the app's `dev` script; docker-compose.yml mounts the app folder and the packages' dist/
FROM deps AS dev
ARG APP
ENV APP=${APP}
CMD pnpm --filter "${APP}" dev

FROM deps AS build
ARG APP
RUN pnpm turbo run build --filter="${APP}"

# Prod: `vite preview` on port 80 (the app's `start` script), which proxies /api and /auth-api (API_PROXY_TARGET, AUTH_PROXY_TARGET)
FROM build AS prod
ARG APP
ENV APP=${APP} NODE_ENV=production
CMD pnpm --filter "${APP}" start
