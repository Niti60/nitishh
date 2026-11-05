import type { VercelRequest, VercelResponse } from "@vercel/node";
import { processContactSubmission, isValidOrigin, MAX_BODY_SIZE } from "../src/lib/contact-service";
import { checkRateLimit } from "../src/lib/rate-limiter";
import { checkRateLimit } from "../src/lib/rate-limiter";

function jsonError(response: VercelResponse, status: number, error: string) {
  response.status(status).json({ success: false, error });
}

function getVercelClientIp(request: VercelRequest): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "127.0.0.1";
  }
  const realIp = request.headers["x-real-ip"];
  if (typeof realIp === "string") {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    return jsonError(response, 405, "Method not allowed.");
  }

  // 1. Content-Type check
  const contentType = request.headers["content-type"];
  if (!contentType || !contentType.toLowerCase().includes("application/json")) {
    return jsonError(response, 415, "Unsupported Content-Type. Expected application/json.");
  }

  // 2. Origin check
  const origin = request.headers.origin;
  if (origin && !isValidOrigin(origin)) {
    return jsonError(response, 403, "Origin not allowed.");
  }

  // 3. Payload size limit
  const contentLength = Number(request.headers["content-length"] ?? 0);
  if (contentLength > MAX_BODY_SIZE) {
    return jsonError(response, 413, "Payload too large.");
  }

  // 4. Rate limiting (max 5 submissions per IP within 15 minutes)
  const clientIp = getVercelClientIp(request);
  const rateLimit = await checkRateLimit(clientIp);

  response.setHeader("X-RateLimit-Limit", rateLimit.limit);
  response.setHeader("X-RateLimit-Remaining", rateLimit.remaining);
  response.setHeader("X-RateLimit-Reset", Math.ceil(rateLimit.resetTime / 1000));

  if (!rateLimit.success) {
    const retryAfter = Math.max(1, Math.ceil((rateLimit.resetTime - Date.now()) / 1000));
    response.setHeader("Retry-After", retryAfter);
    return response.status(429).json({
      success: false,
      error: "Too many requests. Please try again later.",
    });
  }

  let parsedBody: unknown;
  try {
    parsedBody = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  } catch {
    return jsonError(response, 400, "Invalid JSON payload.");
  }

  const result = await processContactSubmission(parsedBody);

  if (result.success) {
    return response.status(200).json(result);
  } else {
    return response.status(result.status).json({
      success: false,
      error: result.error,
      ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}),
    });
  }
}
