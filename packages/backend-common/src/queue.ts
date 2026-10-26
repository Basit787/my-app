import { Queue, Worker, type ConnectionOptions, type Job, type JobsOptions } from "bullmq";

// BullMQ connection options from a redis:// URL; workers need `maxRetriesPerRequest: null`
export const redisConnection = (url: string): ConnectionOptions => {
  const { hostname, port, username, password, pathname } = new URL(url);
  return {
    host: hostname,
    port: Number(port) || 6379,
    username: username || undefined,
    password: password ? decodeURIComponent(password) : undefined,
    db: Number(pathname.slice(1)) || 0,
    maxRetriesPerRequest: null,
  };
};

export type JobProcessor<T> = (job: Job<T>) => Promise<unknown>;

export type JobQueueOptions = {
  redisUrl: string;
  concurrency?: number;
  defaultJobOptions?: JobsOptions;
};

// Removes finished jobs and retries failures three times with backoff
const DEFAULT_JOB_OPTIONS: JobsOptions = {
  removeOnComplete: true,
  removeOnFail: 100,
  attempts: 3,
  backoff: { type: "exponential", delay: 5000 },
};

// One BullMQ queue and its worker: enqueue with add/addAt/every, process after start()
export const createJobQueue = <T>(
  name: string,
  processor: JobProcessor<T>,
  { redisUrl, concurrency = 1, defaultJobOptions }: JobQueueOptions,
) => {
  const connection = redisConnection(redisUrl);
  const queue = new Queue(name, { connection, defaultJobOptions: { ...DEFAULT_JOB_OPTIONS, ...defaultJobOptions } });
  let worker: Worker<T> | null = null;

  return {
    queue,
    add: (data: T, options?: JobsOptions) => queue.add(name, data, options),
    // Runs once at `date`, or right away when it has passed
    addAt: (date: Date, data: T, options?: JobsOptions) =>
      queue.add(name, data, { ...options, delay: Math.max(0, date.getTime() - Date.now()) }),
    // Repeats on a cron pattern; calling it again with the same id updates that schedule
    every: (schedulerId: string, pattern: string, data: T) =>
      queue.upsertJobScheduler(schedulerId, { pattern }, { name, data }),
    start: () => {
      if (worker) return worker;
      worker = new Worker<T>(name, processor, { connection, concurrency });
      worker.on("failed", (job, error) => console.error(`[${name}] job ${job?.id} failed:`, error.message));
      return worker;
    },
    close: async () => {
      await worker?.close();
      await queue.close();
    },
  };
};

export type JobQueue<T> = ReturnType<typeof createJobQueue<T>>;
