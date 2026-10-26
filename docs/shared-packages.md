# Shared packages

Reusable code lives in `packages/*` and is consumed from each package's built `dist/` (through `exports`). Rebuild with `pnpm turbo run build --filter=<package>` (Docker's `packages` service does it on save).

## `my-ui`

- shadcn/ui (new-york, Tailwind 4). `src/ui/` holds the CLI-written primitives; `src/components/<category>/` holds the `MyUi*` wrappers apps should use first: buttons, inputs, `useAppForm` forms, `MyUiDialog`, `MyUiAlertDialog`, `MyUiDropdownMenu`, `MyUiMessage`, `MyUiTable`, `MyUiDataTable` (columns, row actions, bulk actions, table actions), `MyUiSidebarLayout`, `ThemeProvider`, `ModeToggle`; hooks `useNotification`, `useIsMobile`.
- Apps import from `"my-ui"` and `my-ui/globals.css`.

## `frontend-common`

- `AppProviders` (theme, React Query, auth session, tooltips, toaster, cookie consent) and `createQueryClient`.
- API: `createApiClient`, `createAppApiClient(authClient, baseURL)`, `createApiError`, `toApiError`, `readStreamParts` (NDJSON / SSE bodies).
- Auth: `createAuthClient`, `AuthProvider`, `useAuth`, `AuthGate`, `LoginScreen`, `AccountSettings`.
- Navigation (`AppHeader`, `AppBreadcrumbs`, `UserMenu`, `MobileBottomNav`), legal pages and `CookieConsent`, format/file helpers, DOM hooks, chat types and helpers (`src/chat`).

## `backend-common`

- `backend-common`: `HttpError`, `ApiErrorResponse`, `createObjectStorage` (MinIO), `createUploadOptions`, `createJobQueue` + `redisConnection` (BullMQ), `corsOriginCallback`, `isAllowedOrigin`.
- `backend-common/auth`: `createAccessTokenVerifier({ jwksUrl, issuer, audience })` → `userFromToken`, `userFromAuthorizationHeader`; `AuthUser`, `Role`. Used by the Nest apps, the Hono API and the Next app.
- `backend-common/nest`: `AccessTokenModule.forRoot`, `AuthGuard`, `AuthService`, `@Public()`, `@CurrentUser()`, `ApiExceptionFilter`, `httpValidationPipe`, `RequestLoggerMiddleware`, `OkResponseDto`, `ErrorResponseDto`, `AuthenticatedRequest`.

## `ports`

- `PORTS` (every app's port), `APP_PATHS`, `serviceUrl(name)` (URL of another app on the current host), `localAppOrigins()` (default CORS list).

## Config packages

- `vite-config` — `defineAppConfig({ port, api, websocket })`: React, TanStack Router plugin, Tailwind, `/auth-api` and `/api` proxies.
- `eslint-config` (`react`, `node`, `next`), `prettier-config`, `tsconfig` (`node.json`, `react-app.json`).
