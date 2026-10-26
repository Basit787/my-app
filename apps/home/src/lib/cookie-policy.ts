import type { LegalSection } from "./legal-section";

export const COOKIE_POLICY: LegalSection[] = [
  {
    heading: "1. What cookies are",
    paragraphs: [
      "Cookies are small files a website stores in your browser. Local storage works the same way but is only read by the page itself, never sent to a server.",
    ],
  },
  {
    heading: "2. Essential cookies",
    paragraphs: [
      "Sign-in session: set by the auth service when you sign in, so every app on the same host knows it is you. It is removed when you sign out or the session expires.",
      "Cookie choice (cookie_consent): remembers your answer to the cookie banner for one year, so it is not shown again.",
      "These are needed for the apps to work and cannot be turned off.",
    ],
  },
  {
    heading: "3. Preferences in local storage",
    paragraphs: [
      "Theme (light, dark or system), the home page grid or list layout, recently used emojis and messages you hid in chat are kept in your browser only.",
      "Clearing your browser's site data resets them.",
    ],
  },
  {
    heading: "4. What we don't use",
    paragraphs: [
      "No advertising, analytics or third-party tracking cookies. “Accept all” and “Essential only” therefore set the same cookies today; your choice is kept in case that changes.",
    ],
  },
  {
    heading: "5. Managing cookies",
    paragraphs: [
      "You can delete cookies in your browser settings at any time. Deleting the sign-in cookie signs you out; deleting the cookie choice shows the banner again.",
    ],
  },
  {
    heading: "6. Changes to this policy",
    paragraphs: ["We may update this policy. The date at the top shows the latest version."],
  },
];
