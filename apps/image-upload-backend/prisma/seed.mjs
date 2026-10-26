import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma-app/client";
import { createJobQueue, createObjectStorage } from "backend-common";
import { readFile } from "node:fs/promises";

// `prisma db seed` (pnpm db:seed): needs PostgreSQL (migrated), MinIO, Redis and the auth service (seeded first)
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/image_upload";
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
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const DAY_MS = 24 * 60 * 60 * 1000;
const ASSETS = new URL("./seed-assets/", import.meta.url);

// Per demo user: three gallery images, one scheduled for tomorrow, one in the bin
const SEED_IMAGES = [
  { file: "sunrise.png", status: "active" },
  { file: "ocean.png", status: "active" },
  { file: "forest.png", status: "active" },
  { file: "lavender.png", status: "scheduled" },
  { file: "night.png", status: "bin" },
];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
const storage = createObjectStorage({
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  bucket: process.env.MINIO_BUCKET || "image-uploads",
  region: process.env.MINIO_REGION || "us-east-1",
});
// Only enqueues; the running app's PublishImageQueue worker publishes the scheduled image
const publishImageQueue = createJobQueue("publish-image", async () => {}, { redisUrl: REDIS_URL });

const seedUser = async (user) => {
  const existing = await prisma.image.count({ where: { userId: user.id, storedName: { startsWith: "seed/" } } });
  if (existing > 0) {
    console.log(`Images already seeded for ${user.username}`);
    return;
  }

  for (const { file, status } of SEED_IMAGES) {
    const bytes = await readFile(new URL(file, ASSETS));
    const storedName = `seed/${user.id}/${file}`;
    await storage.put(storedName, bytes, "image/png");

    const scheduledAt = status === "scheduled" ? new Date(Date.now() + DAY_MS) : null;
    const image = await prisma.image.create({
      data: {
        userId: user.id,
        originalName: file,
        mimeType: "image/png",
        size: bytes.length,
        storedName,
        status: status === "scheduled" ? "scheduled" : "active",
        scheduledAt,
        deletedAt: status === "bin" ? new Date(Date.now() - 2 * DAY_MS) : null,
      },
    });
    if (scheduledAt) await publishImageQueue.addAt(scheduledAt, { imageId: image.id }, { jobId: image.id });
  }
  console.log(`Seeded ${SEED_IMAGES.length} images for ${user.username}`);
};

const main = async () => {
  await storage.ensureReady();
  try {
    for (const account of SEED_ACCOUNTS) {
      const user = await login(account);
      await seedUser(user);
    }
  } finally {
    await publishImageQueue.close();
    await prisma.$disconnect();
  }
};

await main();
