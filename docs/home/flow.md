# Home — flows

1. The browser opens `http://localhost:3000`; `AuthGate` checks `/auth-api/session` and shows `LoginScreen` when signed out.
2. Signed in, `HomePage` renders one `AppCard` per entry in `src/lib/apps.ts`; every app's dev server is warmed in the background (again on hover) so the first click is fast.
3. Clicking a card opens the app on the same host (`serviceUrl`), where the shared session cookie signs the user in without another login.

Adding an app: add its port to `packages/ports`, then an entry to `src/lib/apps.ts`.
