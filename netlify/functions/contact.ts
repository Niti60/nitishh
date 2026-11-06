import {
  processContactSubmission,
  isValidOrigin,
  normalizeOrigin,
  MAX_BODY_SIZE,
} from "../../src/lib/contact-service.ts";
import { checkRateLimit } from "../../src/lib/rate-limiter.ts";

export default async function handler(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  const normalizedOrigin = origin ? normalizeOrigin(origin) : null;
  const isOriginValid = isValidOrigin(origin);

  // Common response headers with CORS support for permitted origins
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Vary: "Origin",
  };

  if (normalizedOrigin && isOriginValid) {
    defaultHeaders["Access-Control-Allow-Origin"] = normalizedOrigin;
    defaultHeaders["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    defaultHeaders["Access-Control-Allow-Headers"] = "Content-Type, Accept";
    defaultHeaders["Access-Control-Max-Age"] = "86400";
  }

  // Handle CORS preflight OPTIONS
  if (request.method === "OPTIONS") {
    if (origin && !isOriginValid) {
      return new Response(JSON.stringify({ success: false, error: "Origin not allowed." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(null, {
      status: 204,
      headers: defaultHeaders,
    });
  }

  // 1. Method check
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed." }), {
      status: 405,
      headers: defaultHeaders,
    });
  }

  // 2. Origin validation
  if (!isOriginValid) {
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
      headers: defaultHeaders,
    });
  }

  // 4. Content-Type check
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return new Response(JSON.stringify({ success: false, error: "Unsupported media type." }), {
      status: 415,
      headers: defaultHeaders,
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
          ...defaultHeaders,
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
      headers: defaultHeaders,
    });
  }

  // 7. Authoritative submission processing
  const result = await processContactSubmission(rawBody);

  if (result.success) {
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: defaultHeaders,
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
      headers: defaultHeaders,
    },
  );
}
