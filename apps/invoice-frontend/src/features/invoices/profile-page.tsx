import { AppHeader, ProfileScreen } from "frontend-common";

// The signed-in account: name, photo, password and deleting it (shared with every app), theme, sign out
export const ProfilePage = () => (
  <div className="flex min-h-svh flex-col">
    <AppHeader app="Invoices" page="Profile" />
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 md:px-6">
      <ProfileScreen className="overflow-hidden rounded-xl border" />
    </main>
  </div>
);
