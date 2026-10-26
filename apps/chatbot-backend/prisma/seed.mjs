import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { END, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma-app/client";

// `prisma db seed` (pnpm db:seed): needs PostgreSQL (migrated) and the auth service (seeded first)
const DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/chatbot";
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

const CONVERSATIONS = [
  {
    title: "Explain recursion simply",
    turns: [
      [
        "Explain recursion with a simple example",
        "**Recursion** is when a function calls itself to solve a smaller piece of the same problem.\n\n```js\nconst factorial = (n) => (n <= 1 ? 1 : n * factorial(n - 1));\nfactorial(4); // 4 * 3 * 2 * 1 = 24\n```\n\nEvery recursive function needs a **base case** (`n <= 1`) so it stops.",
      ],
      [
        "What happens without a base case?",
        "The function keeps calling itself until the call stack runs out and the program throws a *stack overflow* error.",
      ],
    ],
  },
  {
    title: "Weekend project ideas",
    turns: [
      [
        "Give me 3 ideas for a weekend project",
        "1. **Habit tracker** — a small web app with a calendar of streaks.\n2. **Recipe scaler** — paste a recipe, change the servings, get new amounts.\n3. **Plant watering bot** — a reminder service that pings you on chat.",
      ],
    ],
  },
];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
// Same schema as ChatGraphService; messages are written as if its "model" node replied (no model calls)
const checkpointer = PostgresSaver.fromConnString(DATABASE_URL, { schema: "langgraph" });
const graph = new StateGraph(MessagesAnnotation)
  .addNode("model", () => ({ messages: [] }))
  .addEdge(START, "model")
  .addEdge("model", END)
  .compile({ checkpointer });

const createConversation = async (userId, { title, turns }) => {
  const conversation = await prisma.conversation.create({ data: { userId, title } });
  const messages = [];
  for (const [question, answer] of turns) {
    messages.push(new HumanMessage(question), new AIMessage(answer));
  }
  await graph.updateState({ configurable: { thread_id: conversation.id } }, { messages }, "model");
};

const seedUser = async (user) => {
  const existing = await prisma.conversation.findMany({ where: { userId: user.id }, select: { title: true } });
  let created = 0;
  for (const conversation of CONVERSATIONS) {
    if (existing.some((item) => item.title === conversation.title)) continue;
    await createConversation(user.id, conversation);
    created++;
  }
  console.log(`Seeded ${created} conversations for ${user.username}`);
};

const main = async () => {
  await checkpointer.setup();
  try {
    for (const account of SEED_ACCOUNTS) {
      const user = await login(account);
      await seedUser(user);
    }
  } finally {
    await checkpointer.end();
    await prisma.$disconnect();
  }
};

await main();
