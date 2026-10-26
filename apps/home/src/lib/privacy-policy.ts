import type { LegalSection } from "./legal-section";

export const PRIVACY_POLICY: LegalSection[] = [
  {
    heading: "1. What this policy covers",
    paragraphs: [
      "This policy explains what personal data ChatWave and its apps (Chat, Link Shortener and Image Upload) collect, why, and the choices you have.",
    ],
  },
  {
    heading: "2. Data we collect",
    paragraphs: [
      "Account: your username, email address, a hashed password (never the password itself), an optional profile photo, and your active sign-in sessions.",
      "Chat: the messages, files and group details you send, delivery and read receipts, your online status, and a history of calls (who, when and how long). Calls themselves are not recorded.",
      "Link Shortener: the links you create, and for each visit to a short link its time, referring page and browser type.",
      "Image Upload: the images you upload, their file details, and the times they are scheduled, published or deleted.",
    ],
  },
  {
    heading: "3. How we use it",
    paragraphs: [
      "Only to run the apps for you: signing you in, delivering messages and calls, showing your links' statistics and storing your images.",
      "We do not sell your data or use it for advertising.",
    ],
  },
  {
    heading: "4. Who can see it",
    paragraphs: [
      "Your username, profile photo and online status are visible to other users. Messages and files are visible to the people in that conversation or group.",
      "Your links, their statistics and your images are visible only to you, except for the destination anyone reaches by opening a short link.",
    ],
  },
  {
    heading: "5. Cookies and local storage",
    paragraphs: [
      "We use one sign-in cookie to keep you signed in across the apps and one cookie that remembers your cookie choice. Your browser also stores small preferences such as the theme and the home page layout.",
      "We do not use advertising or tracking cookies. The Cookie Policy lists everything we store.",
    ],
  },
  {
    heading: "6. How long we keep it",
    paragraphs: [
      "We keep your data while your account exists. Images you move to the bin are deleted for good after 30 days.",
      "When you delete your account, your account and the data linked to it are deleted. This cannot be undone.",
    ],
  },
  {
    heading: "7. Your rights",
    paragraphs: [
      "You can view and correct your name, email and profile photo in Profile & settings, remove your photo, and delete your account at any time.",
      "Depending on where you live, you may also have the right to ask for a copy of your data or to object to how it is used.",
    ],
  },
  {
    heading: "8. Security",
    paragraphs: [
      "Passwords are hashed, access to every API needs a signed access token, and each user's data is scoped to their own account. No system is perfectly secure, so use a strong, unique password.",
    ],
  },
  {
    heading: "9. Changes to this policy",
    paragraphs: ["We may update this policy. The date at the top shows the latest version."],
  },
];
