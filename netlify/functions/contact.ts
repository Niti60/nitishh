import {
  processContactSubmission,
  isValidOrigin,
  MAX_BODY_SIZE,
} from "../../src/lib/contact-service.ts";
import { checkRateLimit } from "../../src/lib/rate-limiter.ts";

export default async function handler(request: Request): Promise<Response> {
  // 1. Method check
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed." }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Origin validation
  const origin = request.headers.get("origin") ?? undefined;
  if (!isValidOrigin(origin)) {
    return new Response(JSON.stringify({ success: false, error: "Origin not allowed." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 3. Payload size check
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_SIZE) {
    return new Response(JSON.stringify({ success: false, error: "Payload too large." }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 4. Content-Type check
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return new Response(JSON.stringify({ success: false, error: "Unsupported media type." }), {
      status: 415,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 5. Rate limiting by IP (using Netlify's client IP header)
  const clientIp =
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("client-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";

  const rateLimit = await checkRateLimit(clientIp);
  if (!rateLimit.success) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Too many requests. Please try again later.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
        },
      },
    );
  }

  // 6. JSON body parsing
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false, error: "Invalid JSON payload." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 7. Authoritative submission processing
  const result = await processContactSubmission(rawBody);

  if (result.success) {
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: result.error,
      ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}),
    }),
    {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    },
  );
}
