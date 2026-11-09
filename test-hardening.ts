import { app } from "./server/index.ts";
import {
  contactSchema,
  countWords,
  escapeHtml,
  sanitizeHeaderValue,
  buildHtmlEmail,
} from "./src/lib/contact-service.ts";
import { resetMemoryRateLimiter } from "./src/lib/rate-limiter.ts";
import { calculateScrollProgress } from "./src/lib/scroll-progress.ts";

async function runTests() {
  console.log("=== STARTING SECURITY & VALIDATION TEST SUITE ===\n");
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`FAIL: ${testName} ${detail ? "— " + detail : ""}`);
      failedCount++;
    }
  }

  // --- UNIT TESTS: SCHEMA & SANITIZATION ---
  console.log("--- 1. Name Validation Tests ---");
  assert(
    !contactSchema.safeParse({ name: "", email: "a@b.com", message: "1234567890" }).success,
    "Empty name -> rejected",
  );
  assert(
    !contactSchema.safeParse({ name: "   ", email: "a@b.com", message: "1234567890" }).success,
    "Whitespace-only name -> rejected",
  );

  const words30 = Array(30).fill("word").join(" ");
  assert(
    contactSchema.safeParse({ name: words30, email: "a@b.com", message: "1234567890" }).success,
    `30 words name (words=${countWords(words30)}, len=${words30.length}) -> accepted`,
  );

  const words31 = Array(31).fill("word").join(" ");
  assert(
    !contactSchema.safeParse({ name: words31, email: "a@b.com", message: "1234567890" }).success,
    `31 words name (words=${countWords(words31)}) -> rejected`,
  );

  const chars201 = "a".repeat(201);
  assert(
    !contactSchema.safeParse({ name: chars201, email: "a@b.com", message: "1234567890" }).success,
    `More than 200 characters name (len=${chars201.length}) -> rejected`,
  );

  console.log("\n--- 2. Email Validation Tests ---");
  const validEmail = "nitish@example.com";
  assert(
    contactSchema.safeParse({ name: "Nitish", email: validEmail, message: "1234567890" }).success,
    `Valid email under 70 characters (len=${validEmail.length}) -> accepted`,
  );

  assert(
    !contactSchema.safeParse({
      name: "Nitish",
      email: "invalid-email-address",
      message: "1234567890",
    }).success,
    "Invalid email format -> rejected",
  );

  const longEmail71 = "a".repeat(58) + "@example.com"; // 58 + 12 = 70. Let's make it 71
  const longEmail72 = "a".repeat(59) + "@example.com"; // 59 + 12 = 71
  assert(
    !contactSchema.safeParse({ name: "Nitish", email: longEmail72, message: "1234567890" }).success,
    `More than 70 characters email (len=${longEmail72.length}) -> rejected`,
  );

  console.log("\n--- 3. Message Validation Tests ---");
  assert(
    contactSchema.safeParse({ name: "Nitish", email: "a@b.com", message: "1234567890" }).success,
    "10 characters message -> accepted",
  );

  const msg1000 = "m".repeat(1000);
  assert(
    contactSchema.safeParse({ name: "Nitish", email: "a@b.com", message: msg1000 }).success,
    `1,000 characters message (len=${msg1000.length}) -> accepted`,
  );

  const msg1001 = "m".repeat(1001);
  assert(
    !contactSchema.safeParse({ name: "Nitish", email: "a@b.com", message: msg1001 }).success,
    `More than 1,000 characters message (len=${msg1001.length}) -> rejected`,
  );

  assert(
    !contactSchema.safeParse({ name: "Nitish", email: "a@b.com", message: "" }).success,
    "Empty message -> rejected",
  );

  console.log("\n--- 4. Security & Sanitization Unit Tests ---");
  const xssPayload = "<script>alert('xss')</script>&\"'";
  const escaped = escapeHtml(xssPayload);
  assert(
    !escaped.includes("<script>") && escaped.includes("&lt;script&gt;"),
    "HTML/script payload -> safely escaped",
  );

  const crlfName = "Nitish\r\nBcc: hacker@evil.com\r\nSubject: Overwrite";
  const sanitizedName = sanitizeHeaderValue(crlfName);
  assert(
    !sanitizedName.includes("\r") && !sanitizedName.includes("\n"),
    "CRLF characters stripped to prevent SMTP header injection",
  );

  const htmlEmailOutput = buildHtmlEmail({
    name: "<img src=x onerror=alert(1)>",
    email: "test@example.com",
    message: "<script>evil()</script>",
    website: "",
  });
  assert(
    !htmlEmailOutput.includes("<script>") && htmlEmailOutput.includes("&lt;script&gt;"),
    "Email HTML body escapes all user input",
  );

  // --- ENDPOINT INTEGRATION TESTS ---
  console.log("\n--- 5. Server Endpoint & Abuse Protection Tests ---");
  const testPort = 5003;
  const server = app.listen(testPort, "127.0.0.1", async () => {
    try {
      const baseUrl = `http://127.0.0.1:${testPort}/api/contact`;

      // 5.1 Unsupported Content-Type
      const resContentType = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "name=hello",
      });
      assert(
        resContentType.status === 415,
        `Unsupported Content-Type -> rejected with 415 (got ${resContentType.status})`,
      );

      // 5.2 Malformed JSON
      const resMalformed = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"name": "broken json...',
      });
      const dataMalformed = await resMalformed.json();
      assert(
        resMalformed.status === 400 && dataMalformed.success === false,
        `Malformed JSON -> safe 400 JSON error (got ${resMalformed.status})`,
      );

      // 5.3 Oversized request body (>32KB)
      const oversizedPayload = JSON.stringify({
        name: "Test",
        email: "test@example.com",
        message: "x".repeat(35 * 1024),
      });
      const resOversized = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: oversizedPayload,
      });
      assert(
        resOversized.status === 413,
        `Oversized request body -> rejected with 413 (got ${resOversized.status})`,
      );

      // 5.4 Disallowed Origin
      const resOrigin = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://malicious-site.com",
        },
        body: JSON.stringify({ name: "Test", email: "test@example.com", message: "1234567890" }),
      });
      assert(
        resOrigin.status === 403,
        `Disallowed Origin -> rejected with 403 (got ${resOrigin.status})`,
      );

      // 5.5 Honeypot populated
      resetMemoryRateLimiter(); // Reset for rate limiter testing
      const resHoneypot = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify({
          name: "Bot Sender",
          email: "bot@example.com",
          message: "Legitimate looking message but bot filled website",
          website: "https://spam.com",
        }),
      });
      const dataHoneypot = await resHoneypot.json();
      assert(
        resHoneypot.status === 400 && dataHoneypot.error === "Submission rejected.",
        "Honeypot populated -> rejected safely with generic response",
      );

      // 5.6 Rate Limiting: 5 requests allowed, 6th request rejected with 429
      resetMemoryRateLimiter(); // Start clean
      let rateLimitPassed = true;
      for (let i = 1; i <= 5; i++) {
        const res = await fetch(baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:5173",
          },
          body: JSON.stringify({
            name: `Submitter ${i}`,
            email: `submitter${i}@example.com`,
            message: "Testing rate limiter with invalid email send config",
            website: "",
          }),
        });
        const remaining = res.headers.get("X-RateLimit-Remaining");
        if (res.status === 429) {
          rateLimitPassed = false;
        }
      }
      assert(rateLimitPassed, "First 5 requests within window permitted by rate limiter");

      // 6th request must be 429 Too Many Requests
      const resSixth = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:5173",
        },
        body: JSON.stringify({
          name: "Submitter 6",
          email: "submitter6@example.com",
          message: "This 6th request must be blocked by rate limiter",
        }),
      });
      const dataSixth = await resSixth.json();
      const retryAfter = resSixth.headers.get("Retry-After");
      assert(
        resSixth.status === 429 &&
          dataSixth.success === false &&
          dataSixth.error === "Too many requests. Please try again later." &&
          Boolean(retryAfter),
        `Sixth request within 15 minutes -> rate limited with 429 and Retry-After (got ${resSixth.status})`,
      );

      // --- 6. Centralized API Config & Origin Normalization Tests ---
      console.log("\n--- 6. Centralized API Config & Origin Tests ---");
      const { buildApiUrl, API_BASE_URL } = await import("./src/lib/api-config.ts");
      const { isValidOrigin, normalizeOrigin, getAllowedOrigins } =
        await import("./src/lib/contact-service.ts");

      assert(
        buildApiUrl("/api/contact") ===
          (API_BASE_URL ? `${API_BASE_URL}/api/contact` : "/api/contact"),
        "buildApiUrl cleanly formats endpoint without double slashes",
      );
      assert(
        normalizeOrigin("https://nitishh.netlify.app/") === "https://nitishh.netlify.app",
        "normalizeOrigin trims trailing slash and lowercases",
      );
      assert(
        normalizeOrigin("https://NITISHH.NETLIFY.APP") === "https://nitishh.netlify.app",
        "normalizeOrigin normalizes casing",
      );
      assert(
        normalizeOrigin("not-a-valid-url") === null,
        "normalizeOrigin returns null for invalid URLs",
      );

      // Origin unit assertions
      assert(isValidOrigin("https://nitishyadav.com"), "Origin https://nitishyadav.com is allowed");
      assert(
        isValidOrigin("https://www.nitishyadav.com"),
        "Origin https://www.nitishyadav.com is allowed",
      );
      assert(
        isValidOrigin("https://www.nitishyadav.com/"),
        "Origin https://www.nitishyadav.com/ (with trailing slash) is normalized and allowed",
      );
      assert(
        isValidOrigin("HTTPS://WWW.NITISHYADAV.COM"),
        "Origin HTTPS://WWW.NITISHYADAV.COM (uppercase) is normalized and allowed",
      );
      assert(
        isValidOrigin("https://nitishh.vercel.app"),
        "Origin https://nitishh.vercel.app is allowed",
      );
      assert(
        isValidOrigin("https://nitishh-git-main-niti60.vercel.app"),
        "Origin https://nitishh-git-main-niti60.vercel.app is allowed",
      );
      assert(
        isValidOrigin("https://nitishh.netlify.app"),
        "Origin https://nitishh.netlify.app is allowed",
      );
      assert(isValidOrigin("http://localhost:5173"), "Origin http://localhost:5173 is allowed");
      assert(isValidOrigin("http://localhost:3000"), "Origin http://localhost:3000 is allowed");
      assert(isValidOrigin("http://127.0.0.1:5173"), "Origin http://127.0.0.1:5173 is allowed");

      // Untrusted origins
      assert(
        !isValidOrigin("https://malicious-site.com"),
        "Origin https://malicious-site.com is rejected",
      );
      assert(
        !isValidOrigin("https://nitishyadav.com.evil.com"),
        "Origin https://nitishyadav.com.evil.com (subdomain spoofing) is rejected",
      );
      assert(
        !isValidOrigin("https://www.nitishyadav.com.evil.com"),
        "Origin https://www.nitishyadav.com.evil.com (subdomain spoofing) is rejected",
      );
      assert(
        !isValidOrigin("https://fake-nitishyadav.com"),
        "Origin https://fake-nitishyadav.com is rejected",
      );
      assert(
        !isValidOrigin("http://nitishyadav.com"),
        "Insecure http://nitishyadav.com in production is rejected",
      );

      // Malformed origins
      assert(!isValidOrigin("null"), "Origin 'null' string is rejected");
      assert(!isValidOrigin("not-a-valid-url"), "Malformed origin 'not-a-valid-url' is rejected");
      assert(
        !isValidOrigin("javascript:alert(1)"),
        "Malformed origin 'javascript:alert(1)' is rejected",
      );
      assert(!isValidOrigin("file:///etc/passwd"), "Malformed origin 'file:///...' is rejected");
      assert(!isValidOrigin("://bad-protocol"), "Malformed origin '://bad-protocol' is rejected");

      // Missing origin tests
      assert(
        isValidOrigin(undefined),
        "Missing origin (undefined) is permitted for server-to-server calls when REQUIRE_ORIGIN is unset",
      );
      assert(
        isValidOrigin(null),
        "Missing origin (null) is permitted for server-to-server calls when REQUIRE_ORIGIN is unset",
      );
      assert(
        isValidOrigin(""),
        "Missing origin (empty string) is permitted for server-to-server calls when REQUIRE_ORIGIN is unset",
      );

      // Missing origin when REQUIRE_ORIGIN=true
      process.env["REQUIRE_ORIGIN"] = "true";
      assert(
        !isValidOrigin(undefined),
        "Missing origin (undefined) is rejected when REQUIRE_ORIGIN=true",
      );
      assert(!isValidOrigin(null), "Missing origin (null) is rejected when REQUIRE_ORIGIN=true");
      assert(!isValidOrigin(""), "Missing origin ('') is rejected when REQUIRE_ORIGIN=true");
      delete process.env["REQUIRE_ORIGIN"];

      // --- 7. Unified Server Entry & Netlify Function Tests ---
      console.log("\n--- 7. Unified Server Entry & Netlify Function Tests ---");
      resetMemoryRateLimiter(); // Reset rate limiter for function tests
      const netlifyHandler = (await import("./netlify/functions/contact.ts")).default;
      const startServer = (await import("./src/server.ts")).default;

      // GET to server endpoint -> 405 Method Not Allowed
      const resServerGet = await fetch(baseUrl, { method: "GET" });
      const dataServerGet = await resServerGet.json();
      assert(
        resServerGet.status === 405 && dataServerGet.error === "Method not allowed.",
        "GET /api/contact on server returns 405 JSON",
      );

      // Unified server entry: GET /api/contact -> 405 Method Not Allowed
      const vercelGetReq = new Request("https://nitishh.vercel.app/api/contact", {
        method: "GET",
      });
      const vercelGetRes = await startServer.fetch(vercelGetReq, {}, {});
      const vercelGetData = await vercelGetRes.json();
      assert(
        vercelGetRes.status === 405 && vercelGetData.error === "Method not allowed.",
        "Unified server.ts GET /api/contact returns 405 JSON",
      );

      // Netlify function: GET -> 405 Method Not Allowed
      const netlifyGetReq = new Request("https://nitishh.netlify.app/api/contact", {
        method: "GET",
      });
      const netlifyGetRes = await netlifyHandler(netlifyGetReq);
      const netlifyGetData = await netlifyGetRes.json();
      assert(
        netlifyGetRes.status === 405 && netlifyGetData.error === "Method not allowed.",
        "Netlify function GET returns 405 JSON",
      );

      // Unified server entry: OPTIONS preflight from https://www.nitishyadav.com -> 204 with CORS header
      const wwwOptionsReq = new Request("https://www.nitishyadav.com/api/contact", {
        method: "OPTIONS",
        headers: { Origin: "https://www.nitishyadav.com" },
      });
      const wwwOptionsRes = await startServer.fetch(wwwOptionsReq, {}, {});
      assert(
        wwwOptionsRes.status === 204 &&
          wwwOptionsRes.headers.get("Access-Control-Allow-Origin") ===
            "https://www.nitishyadav.com",
        "Unified server.ts OPTIONS from https://www.nitishyadav.com returns 204 with Access-Control-Allow-Origin",
      );

      // Unified server entry: OPTIONS preflight from https://nitishyadav.com -> 204 with CORS header
      const apexOptionsReq = new Request("https://nitishyadav.com/api/contact", {
        method: "OPTIONS",
        headers: { Origin: "https://nitishyadav.com" },
      });
      const apexOptionsRes = await startServer.fetch(apexOptionsReq, {}, {});
      assert(
        apexOptionsRes.status === 204 &&
          apexOptionsRes.headers.get("Access-Control-Allow-Origin") === "https://nitishyadav.com",
        "Unified server.ts OPTIONS from https://nitishyadav.com returns 204 with Access-Control-Allow-Origin",
      );

      // Unified server entry: OPTIONS preflight from allowed Vercel origin -> 204 with CORS headers
      const vercelOptionsReq = new Request("https://nitishh.vercel.app/api/contact", {
        method: "OPTIONS",
        headers: { Origin: "https://nitishh.vercel.app" },
      });
      const vercelOptionsRes = await startServer.fetch(vercelOptionsReq, {}, {});
      assert(
        vercelOptionsRes.status === 204 &&
          vercelOptionsRes.headers.get("Access-Control-Allow-Origin") ===
            "https://nitishh.vercel.app",
        "Unified server.ts OPTIONS from allowed origin returns 204 with Access-Control-Allow-Origin",
      );

      // Netlify function: OPTIONS preflight from allowed origin -> 204 with CORS headers
      const netlifyOptionsReq = new Request("https://nitishh.netlify.app/api/contact", {
        method: "OPTIONS",
        headers: { Origin: "https://nitishh.netlify.app" },
      });
      const netlifyOptionsRes = await netlifyHandler(netlifyOptionsReq);
      assert(
        netlifyOptionsRes.status === 204 &&
          netlifyOptionsRes.headers.get("Access-Control-Allow-Origin") ===
            "https://nitishh.netlify.app",
        "Netlify function OPTIONS from allowed origin returns 204 with Access-Control-Allow-Origin",
      );

      // Unified server entry: POST from unapproved origin -> 403 Forbidden
      const serverForbiddenReq = new Request("https://nitishyadav.com/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://unauthorized-domain.com",
        },
        body: JSON.stringify({ name: "A", email: "a@b.com", message: "1234567890" }),
      });
      const serverForbiddenRes = await startServer.fetch(serverForbiddenReq, {}, {});
      const serverForbiddenData = await serverForbiddenRes.json();
      assert(
        serverForbiddenRes.status === 403 && serverForbiddenData.error === "Origin not allowed.",
        "Unified server.ts POST from unapproved origin returns 403 Origin not allowed",
      );

      // Netlify function: POST from unapproved origin -> 403 Forbidden
      const netlifyForbiddenReq = new Request("https://nitishh.netlify.app/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://unauthorized-domain.com",
        },
        body: JSON.stringify({ name: "A", email: "a@b.com", message: "1234567890" }),
      });
      const netlifyForbiddenRes = await netlifyHandler(netlifyForbiddenReq);
      const netlifyForbiddenData = await netlifyForbiddenRes.json();
      assert(
        netlifyForbiddenRes.status === 403 && netlifyForbiddenData.error === "Origin not allowed.",
        "Netlify function POST from unapproved origin returns 403 Origin not allowed",
      );

      // Unified server entry: POST from https://www.nitishyadav.com with validation trigger -> 400 with CORS header
      const wwwValidOriginReq = new Request("https://www.nitishyadav.com/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://www.nitishyadav.com",
        },
        body: JSON.stringify({ name: "", email: "not-an-email", message: "" }),
      });
      const wwwValidOriginRes = await startServer.fetch(wwwValidOriginReq, {}, {});
      const wwwValidOriginData = await wwwValidOriginRes.json();
      assert(
        wwwValidOriginRes.status === 400 &&
          wwwValidOriginData.success === false &&
          Boolean(wwwValidOriginData.fieldErrors) &&
          wwwValidOriginRes.headers.get("Access-Control-Allow-Origin") ===
            "https://www.nitishyadav.com",
        "Unified server.ts POST from https://www.nitishyadav.com is accepted and validated with CORS header",
      );

      // Unified server entry: POST from https://nitishyadav.com with validation trigger -> 400 with CORS header
      const apexValidOriginReq = new Request("https://nitishyadav.com/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://nitishyadav.com",
        },
        body: JSON.stringify({ name: "", email: "not-an-email", message: "" }),
      });
      const apexValidOriginRes = await startServer.fetch(apexValidOriginReq, {}, {});
      const apexValidOriginData = await apexValidOriginRes.json();
      assert(
        apexValidOriginRes.status === 400 &&
          apexValidOriginData.success === false &&
          Boolean(apexValidOriginData.fieldErrors) &&
          apexValidOriginRes.headers.get("Access-Control-Allow-Origin") ===
            "https://nitishyadav.com",
        "Unified server.ts POST from https://nitishyadav.com is accepted and validated with CORS header",
      );

      // Unified server entry: POST from https://nitishh.vercel.app with validation trigger -> 400 with CORS header
      const vercelValidOriginReq = new Request("https://nitishh.vercel.app/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://nitishh.vercel.app",
        },
        body: JSON.stringify({ name: "", email: "not-an-email", message: "" }),
      });
      const vercelValidOriginRes = await startServer.fetch(vercelValidOriginReq, {}, {});
      const vercelValidOriginData = await vercelValidOriginRes.json();
      assert(
        vercelValidOriginRes.status === 400 &&
          vercelValidOriginData.success === false &&
          Boolean(vercelValidOriginData.fieldErrors) &&
          vercelValidOriginRes.headers.get("Access-Control-Allow-Origin") ===
            "https://nitishh.vercel.app",
        "Unified server.ts POST from https://nitishh.vercel.app is accepted and validated with CORS header",
      );

      // --- 8. Scroll Progress Calculation Unit Tests ---
      console.log("\n--- 8. Scroll Progress Calculation Tests ---");
      assert(
        calculateScrollProgress(0, 2000, 1000) === 0,
        "Scroll progress at top (scrollTop=0) is exactly 0%",
      );
      const p25 = calculateScrollProgress(250, 2000, 1000);
      assert(
        Math.abs(p25 - 25) < 0.01,
        `Scroll progress at ~25% scroll is 25% (got ${p25}%)`,
      );
      const p50 = calculateScrollProgress(500, 2000, 1000);
      assert(
        Math.abs(p50 - 50) < 0.01,
        `Scroll progress at ~50% scroll is 50% (got ${p50}%)`,
      );
      const p75 = calculateScrollProgress(750, 2000, 1000);
      assert(
        Math.abs(p75 - 75) < 0.01,
        `Scroll progress at ~75% scroll is 75% (got ${p75}%)`,
      );
      assert(
        calculateScrollProgress(1000, 2000, 1000) === 100,
        "Scroll progress at absolute bottom (scrollTop=1000) is exactly 100%",
      );
      assert(
        calculateScrollProgress(998.5, 2000, 1000) === 100,
        "Scroll progress within 2px rounding tolerance of bottom snaps to 100%",
      );
      assert(
        calculateScrollProgress(0, 1000, 1000) === 0,
        "Scroll progress when content does not overflow (scrollHeight == clientHeight) is 0%",
      );
      assert(
        calculateScrollProgress(100, 800, 1000) === 0,
        "Scroll progress when content is shorter than viewport (scrollHeight < clientHeight) is 0%",
      );
      assert(
        calculateScrollProgress(-50, 2000, 1000) === 0,
        "Scroll progress clamps negative scrollTop (iOS rubber-banding) to 0%",
      );
      assert(
        calculateScrollProgress(1200, 2000, 1000) === 100,
        "Scroll progress clamps overscroll to 100%",
      );

      console.log("\n==========================================");
      console.log(
        `TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`,
      );
      console.log("==========================================\n");
    } catch (err) {
      console.error("Test execution failure:", err);
    } finally {
      server.close(() => process.exit(failedCount > 0 ? 1 : 0));
    }
  });
}

runTests();
