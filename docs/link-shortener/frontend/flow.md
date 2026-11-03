# Link shortener UI — flows

1. `AuthGate` shows the shared login screen until signed in; then `LinksPage` opens on the Create tab.
2. Submitting the form posts `/api/links`; errors (such as a taken slug, `409`) show as a toast with the server message; success shows "Short link created", invalidates the `links` query and switches to the Links tab.
3. The table copies `<page origin>/r/<slug>`; opening it goes through this app's `/r` proxy to the backend, which redirects and records the click.
4. "Click stats" loads `/api/links/:id/stats` into the chart dialog; delete asks for confirmation, then refreshes the list.
