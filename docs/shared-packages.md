# Shared packages

Reusable code lives in `packages/*` and is consumed from each package's built `dist/` (through `exports`). Rebuild with `pnpm turbo run build --filter=<package>` (Docker's `packages` service does it on save).

## `my-ui`

- shadcn/ui (new-york, Tailwind 4). `src/ui/` holds the CLI-written primitives; `src/components/<category>/` holds the `MyUi*` wrappers apps should use first: buttons, inputs, `useAppForm` forms, `MyUiDialog`, `MyUiAlertDialog`, `MyUiDropdownMenu`, `MyUiTabs`, `MyUiMessage`, `MyUiTable`, `MyUiDataTable` (columns, row actions, bulk actions, table actions), `MyUiSidebarLayout`, `ThemeProvider`, `ModeToggle`; hooks `useNotification`, `useIsMobile`.
- Apps import from `"my-ui"` and `my-ui/globals.css`.

## `frontend-common`

- `AppProviders` (theme, React Query, auth, tooltips, toaster, cookie consent) and `createQueryClient`.
- API: `createApiClient`, `createAppApiClient(authClient, baseURL)` (adds `Authorization: Bearer`), `createApiError`, `toApiError`, `readStreamParts` (NDJSON / SSE bodies).
- Auth: `createAuthClient` (register, login, `me`, avatar, delete account; keeps the token in the `access_token` cookie), `AuthProvider`, `useAuth`, `AuthGate`, `LoginScreen`, `AccountSettings`, `DeleteAccountPage`.
- Navigation (`AppHeader`, `AppBreadcrumbs`, `UserMenu`, `MobileBottomNav`, `ProfileScreen`), legal links and `CookieConsent`, `formatFileSize` and clipboard helpers.

## `backend-common`

One entry for every Nest backend:

- Auth: `signAccessToken` (auth service only) and `verifyAccessToken` — HS256 JWTs with `JWT_SECRET`; `bearerToken`, `AuthUser`, `Role`, `AuthenticatedRequest`; `JwtAuthModule` (registers the global `AuthGuard`), `@Public()`, `@CurrentUser()`.
- App setup: `securityHeaders()` (helmet), `setupSwagger(app, { title, description })` (Swagger UI at `/docs`), `RequestLoggerMiddleware`.
- Errors: `ApiExceptionFilter` (every error → `{ error, details? }`), `httpValidationPipe()` (400 `{ error: "Invalid request", details }`), `HttpError`, `ApiErrorResponse`, `ErrorResponseDto`, `OkResponseDto`.
- Storage: `ObjectStorageModule.forRoot(...)` / `ObjectStorageService` (the app's S3 bucket, created on start; `streamFile` returns a `StreamableFile`), `createObjectStorage`, `createUploadOptions`, `uniqueObjectKey`, `entityObjectKey`, `UploadedFileData`.
- Queues: `createJobQueue` (BullMQ queue + worker with `add`, `addAt`, `every`, `start`), `redisConnection`.
- CORS: `corsOriginCallback`, `isAllowedOrigin` (configured origins plus private-network origins when `allowLanOrigins`).
- `runCommand` — a CLI tool's stdout; a failure carries the tool's stderr (used for `pdftotext`, Tesseract and Poppler).
- Built by tsup without decorator metadata, so its providers use explicit `@Inject(...)` and its DTOs explicit Swagger `type`s.

## `ports`

- `PORTS` (every app's frontend and backend port), `APP_PATHS` and `APP_SUBDOMAINS` (deployed paths and host names).
- `serviceUrl(project, side)` — URL of another app on the host the page was opened from (`localhost`, a LAN IP or a deployed domain); `localAppOrigins()` — the default CORS list.

## Config packages

- `vite-config` — `defineAppConfig({ port, api, passthrough })`: React, TanStack Router plugin, Tailwind, `/auth-api` → auth service and `/api` → the app's backend (prefix stripped); `passthrough` paths go to the backend unchanged (the link shortener's `/r`).
- `eslint-config` (`base`, `react`, `node`), `prettier-config` (double quotes, semicolons, trailing commas, width 120), `tsconfig` (`base`, `node`, `react-app`, `react-library`).
