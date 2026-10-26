import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma-app/client";
import { createObjectStorage } from "backend-common";
import { randomUUID } from "node:crypto";

// `prisma db seed` (pnpm db:seed): needs PostgreSQL (migrated), MinIO and the auth service (seeded first)
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/ai_summary";
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

// Finished documents with ready-made summaries, so seeding needs no model calls
const SEED_DOCUMENTS = [
  {
    filename: "release-notes.txt",
    text: "Version 2.4 adds bulk editing, faster CSV export for large reports, and a dark mode that remembers your choice after logging out. The onboarding flow drops from seven steps to four.",
    summary:
      "Release 2.4 brings bulk editing, a faster CSV export, a persistent dark mode and a four-step onboarding flow.",
  },
  {
    filename: "meeting-notes.txt",
    text: "The team moved the release to Wednesday to keep two full days of regression testing. Bulk editing is the top priority for next quarter because two enterprise customers asked for it.",
    summary:
      "The release moves to Wednesday to protect regression testing, and bulk editing becomes next quarter's top priority after enterprise requests.",
  },
];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
const storage = createObjectStorage({
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  bucket: process.env.MINIO_BUCKET || "ai-summaries",
  region: process.env.MINIO_REGION || "us-east-1",
});

const seedUser = async (user) => {
  let created = 0;
  for (const item of SEED_DOCUMENTS) {
    if (await prisma.document.findFirst({ where: { userId: user.id, filename: item.filename } })) continue;
    const content = Buffer.from(item.text, "utf8");
    const storageKey = `${user.id}/${randomUUID()}.txt`;
    await storage.put(storageKey, content, "text/plain; charset=utf-8");
    await prisma.document.create({
      data: {
        userId: user.id,
        filename: item.filename,
        storageKey,
        size: content.length,
        status: "COMPLETED",
        summary: item.summary,
      },
    });
    created++;
  }
  console.log(`Seeded ${created} documents for ${user.username}`);
};

const main = async () => {
  await storage.ensureReady();
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
