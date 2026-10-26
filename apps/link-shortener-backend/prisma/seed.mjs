import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma-app/client";

// `prisma db seed` (pnpm db:seed): needs PostgreSQL (migrated) and the auth service (seeded first)
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/link_shortener";
// The auth service the demo users sign in on
const AUTH_URL = process.env.AUTH_URL || "http://localhost:3001";

// Demo users the seed logs in as; register them in any app first
const SEED_ACCOUNTS = [
  { email: "admin@chat.local", password: "Admin123!" },
  { email: "alice@chat.local", password: "Alice123!" },
  { email: "bob@chat.local", password: "Bob12345!" },
];

// Logs a demo user in on the auth service and returns its id and username
const login = async ({ email, password }) => {
  const response = await fetch(`${AUTH_URL}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`Login failed for ${email} (${response.status}); register this account first`);
  const { user } = await response.json();
  return { id: user.id, username: user.name };
};
const DAY_MS = 24 * 60 * 60 * 1000;

// Per demo user; slugs are global, so each gets the username as a prefix
const SEED_LINKS = [
  { slug: "docs", url: "https://nextjs.org/docs", title: "Next.js docs" },
  { slug: "repo", url: "https://github.com/vercel/next.js", title: "Next.js on GitHub" },
  { slug: "news", url: "https://news.ycombinator.com", title: "Hacker News" },
];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });

// A few clicks on most of the last 30 days, so the stats chart has data
const demoClicks = (linkId) => {
  const clicks = [];
  for (let day = 0; day < 30; day++) {
    const count = (day * 7 + linkId.charCodeAt(0)) % 5;
    for (let i = 0; i < count; i++) {
      clicks.push({
        linkId,
        referrer: "https://google.com",
        userAgent: "seed",
        createdAt: new Date(Date.now() - day * DAY_MS),
      });
    }
  }
  return clicks;
};

const seedUser = async (user) => {
  let created = 0;
  for (const item of SEED_LINKS) {
    const slug = `${user.username}-${item.slug}`;
    if (await prisma.link.findUnique({ where: { slug } })) continue;
    const link = await prisma.link.create({ data: { ...item, slug, userId: user.id } });
    const clicks = demoClicks(link.id);
    await prisma.click.createMany({ data: clicks });
    await prisma.link.update({ where: { id: link.id }, data: { clickCount: clicks.length } });
    created++;
  }
  console.log(`Seeded ${created} links for ${user.username}`);
};

const main = async () => {
  try {
    for (const account of SEED_ACCOUNTS) {
      const user = await login(account);
      await seedUser(user);
    }
  } finally {
    await prisma.$disconnect();
  }
};

await main();
