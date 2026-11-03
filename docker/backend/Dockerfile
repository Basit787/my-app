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
ARG SYSTEM_PACKAGES=""
RUN if [ -n "$SYSTEM_PACKAGES" ]; then apk add --no-cache $SYSTEM_PACKAGES; fi
ENV APP=${APP}
CMD pnpm --filter "${APP}" dev

# Build: compile the app, then copy it with only its production dependencies to /out
FROM deps AS build
ARG APP
RUN pnpm turbo run build --filter="${APP}"
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm --filter "${APP}" deploy --prod --legacy --store-dir /pnpm/store /out \
  && cp -r "$(pnpm --filter "${APP}" exec pwd)/dist" /out/ \
  && cd /out && npx prisma generate

# Prod: the deployed app; migrations on start, then the app
FROM ${NODE_IMAGE} AS prod
ARG SYSTEM_PACKAGES=""
RUN if [ -n "$SYSTEM_PACKAGES" ]; then apk add --no-cache $SYSTEM_PACKAGES; fi
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out .
CMD ["npm", "start"]
