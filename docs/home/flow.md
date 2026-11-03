# Home — flows

1. The browser opens `http://localhost:3000`; `AuthGate` restores the saved token and shows `LoginScreen` when signed out.
2. Signed in, `HomePage` renders one `AppCard` per entry in `src/lib/apps.ts`; card URLs come from `serviceUrl`, the other app's port on the address the page was opened from (`localhost` or a Wi-Fi IP).
3. Clicking a card opens the app, which reads the same `access_token` cookie (cookies ignore the port), so the user is already signed in.

Adding an app: add its port to `packages/ports`, then an entry to `src/lib/apps.ts`.
