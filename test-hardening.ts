import { app } from "./server/index.ts";
import {
  contactSchema,
  countWords,
  escapeHtml,
  sanitizeHeaderValue,
  buildHtmlEmail,
} from "./src/lib/contact-service.ts";
import { resetMemoryRateLimiter } from "./src/lib/rate-limiter.ts";

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
