ARG NODE_IMAGE=node:24.22.1-alpine

# Base: Node with pnpm
FROM ${NODE_IMAGE} AS base
RUN corepack enable pnpm
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /repo

# Deps: download packages from the lockfile, install the workspace, build the shared packages
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm fetch --store-dir /pnpm/store
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm install --offline --frozen-lockfile --store-dir /pnpm/store
RUN pnpm turbo run build --filter="./packages/*"

# Dev: run the app's dev script (watch mode)
FROM deps AS dev
ARG APP
ENV APP=${APP}
CMD pnpm --filter "${APP}" dev

# Prod: build the app and serve it with vite preview
FROM deps AS prod
ARG APP
ENV APP=${APP}
RUN pnpm turbo run build --filter="${APP}"
CMD pnpm --filter "${APP}" exec vite preview
