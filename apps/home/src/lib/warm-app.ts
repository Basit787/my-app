const warmed = new Set<string>();

// Wakes another app's dev server ahead of the click (Next compiles the page on its first request)
export const warmApp = (url: string) => {
  if (warmed.has(url)) return;
  warmed.add(url);
  fetch(url, { mode: "no-cors", credentials: "omit" }).catch(() => warmed.delete(url));
};
