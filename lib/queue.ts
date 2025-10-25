import { Queue } from "bullmq";
import { Redis } from "ioredis";

const redis = new Redis({
  host: "127.0.0.1", // Docker Redis container accessible via this IP
  port: 6379,
  maxRetriesPerRequest: null,
});
// Create a new queue
export const emailQueue = new Queue("emailQueue", {
  connection: redis,
});
