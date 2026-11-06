import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  contactSchema,
  processContactSubmission,
  isValidOrigin,
  MAX_BODY_SIZE,
} from "../src/lib/contact-service.ts";
import { checkRateLimit } from "../src/lib/rate-limiter.ts";

dotenv.config();

const app = express();
const PORT = Number(process.env["PORT"]) || 5001;

// Only trust proxy headers when explicitly enabled in deployment environment
if (process.env["TRUST_PROXY"] === "true" || process.env["TRUST_PROXY"] === "1") {
  app.set("trust proxy", 1);
} else {
  app.set("trust proxy", false);
}

// Request timeout middleware (15 seconds)
app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(15000, () => {
    if (!res.headersSent) {
      res.status(504).json({ success: false, error: "Request timed out." });
    }
  });
  next();
});

// CORS origin handler
app.use(
  cors({
    origin: (origin, callback) => {
      if (isValidOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin not allowed"));
      }
    },
    credentials: true,
  }),
);

// Payload size limit & JSON parser (32KB max)
app.use(express.json({ limit: MAX_BODY_SIZE }));

// Handle invalid JSON syntax and oversized payloads safely
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err && typeof err === "object") {
    const errorObj = err as { type?: string; status?: number; message?: string };
    if (errorObj.message === "Origin not allowed") {
      res.status(403).json({ success: false, error: "Origin not allowed." });
      return;
    }
    if (errorObj.type === "entity.too.large" || errorObj.status === 413) {
      res.status(413).json({ success: false, error: "Payload too large." });
      return;
    }
    if (err instanceof SyntaxError && "body" in err) {
      res.status(400).json({ success: false, error: "Invalid JSON payload." });
      return;
    }
  }
  next();
});

// Helper to obtain client IP without trusting spoofable headers unless trust proxy is active
function getClientIp(req: Request): string {
  // When trust proxy is false, req.ip falls back to req.socket.remoteAddress
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}

// GET /api/contact -> 405 Method Not Allowed
app.get("/api/contact", (_req: Request, res: Response) => {
  res.status(405).json({ success: false, error: "Method not allowed." });
});

// POST /api/contact -> rate limiting, origin check, content-type check, and submission
app.post("/api/contact", async (req: Request, res: Response) => {
  // 1. Content-Type verification
  const contentType = req.headers["content-type"];
  if (!contentType || !contentType.toLowerCase().includes("application/json")) {
    res.status(415).json({
      success: false,
      error: "Unsupported Content-Type. Expected application/json.",
    });
    return;
  }

  // 2. Origin check
  const origin = req.headers.origin;
  if (origin && !isValidOrigin(origin)) {
    res.status(403).json({ success: false, error: "Origin not allowed." });
    return;
  }

  // 3. Rate limiting (maximum 5 submissions per IP within 15 minutes)
  const clientIp = getClientIp(req);
  const rateLimit = await checkRateLimit(clientIp);

  res.setHeader("X-RateLimit-Limit", rateLimit.limit);
  res.setHeader("X-RateLimit-Remaining", rateLimit.remaining);
  res.setHeader("X-RateLimit-Reset", Math.ceil(rateLimit.resetTime / 1000));

  if (!rateLimit.success) {
    const retryAfter = Math.max(1, Math.ceil((rateLimit.resetTime - Date.now()) / 1000));
    res.setHeader("Retry-After", retryAfter);
    res.status(429).json({
      success: false,
      error: "Too many requests. Please try again later.",
    });
    return;
  }

  // 4. Submission processing
  const result = await processContactSubmission(req.body);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(result.status).json({
      success: false,
      error: result.error,
      ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}),
    });
  }
});

// Catch-all 404 for any other /api routes
app.all("/api/*", (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Not found." });
});

export { app, contactSchema, PORT };

// When executed directly (e.g. via `bun run server/index.ts` or `tsx watch server/index.ts`)
const isMain =
  (typeof require !== "undefined" && require.main === module) ||
  (typeof process !== "undefined" &&
    process.argv[1] &&
    (process.argv[1].endsWith("server/index.ts") || process.argv[1].endsWith("server\\index.ts")));

if (isMain) {
  app.listen(PORT, () => {
    console.log(`Local API server running on http://localhost:${PORT}`);
  });
}
