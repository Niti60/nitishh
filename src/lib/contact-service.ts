import { Resend } from "resend";
import { z } from "zod";

/**
 * Counts the number of words in a string by splitting on whitespace.
 */
export function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/**
 * Strips CRLF characters to prevent email header injection.
 */
export function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/**
 * Authoritative Zod schema enforced on both frontend and backend.
 * Limits:
 * - Name: Required, non-empty, max 200 chars, max 30 words.
 * - Email: Required, valid email format, max 70 chars.
 * - Message: Required, non-empty, min 10 chars, max 1,000 chars.
 * - Website: Honeypot field, must be empty.
 */
export const contactSchema = z.object({
  name: z
    .string({ required_error: "Name is required." })
    .trim()
    .min(1, "Name is required.")
    .max(200, "Name must be 200 characters or less.")
    .refine((val) => countWords(val) <= 30, {
      message: "Name must be 30 words or less.",
    }),
  email: z
    .string({ required_error: "Email is required." })
    .trim()
    .min(1, "Email is required.")
    .max(70, "Email must be 70 characters or less.")
    .email("Please enter a valid email address."),
  message: z
    .string({ required_error: "Message is required." })
    .trim()
    .min(1, "Message is required.")
    .min(10, "Message must be at least 10 characters.")
    .max(1000, "Message must be 1,000 characters or less."),
  website: z.string().trim().max(1000).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const MAX_BODY_SIZE = 32 * 1024; // 32KB
const RESEND_TIMEOUT_MS = 10000; // 10 seconds

export const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5001",
  "https://nitishh.netlify.app",
  "https://nitishyadav.com",
];

/**
 * Safely parses and normalizes an origin string into standard protocol://host(:port) lowercase format.
 * Returns null if the origin is invalid or not an http/https URL.
 */
export function normalizeOrigin(origin: string): string | null {
  try {
    const trimmed = origin.trim();
    if (!trimmed) return null;
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Retrieves the explicit list of allowed origins from defaults and environment variables.
 */
export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  // Add default verified production and local origins
  for (const origin of DEFAULT_ALLOWED_ORIGINS) {
    const normalized = normalizeOrigin(origin);
    if (normalized) origins.add(normalized);
  }

  // Parse comma-separated ALLOWED_ORIGINS environment variable
  const envAllowed = process.env["ALLOWED_ORIGINS"];
  if (envAllowed) {
    const parts = envAllowed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of parts) {
      const normalized = normalizeOrigin(part);
      if (normalized) origins.add(normalized);
    }
  }

  // Legacy singular ALLOWED_ORIGIN fallback
  const singularAllowed = process.env["ALLOWED_ORIGIN"]?.trim();
  if (singularAllowed) {
    const normalized = normalizeOrigin(singularAllowed);
    if (normalized) origins.add(normalized);
  }

  // Configured APP_URL environment variable
  const appUrl = process.env["APP_URL"]?.trim();
  if (appUrl) {
    const normalized = normalizeOrigin(appUrl);
    if (normalized) origins.add(normalized);
  }

  return Array.from(origins);
}

/**
 * Validates whether an incoming Origin header is permitted.
 * Missing origins are safely accepted for non-browser/server-to-server calls unless REQUIRE_ORIGIN=true.
 */
export function isValidOrigin(origin: string | undefined | null): boolean {
  if (origin === undefined || origin === null || origin === "") {
    return process.env["REQUIRE_ORIGIN"] !== "true";
  }

  if (typeof origin !== "string") return false;

  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;

  const allowed = getAllowedOrigins();
  return allowed.includes(normalized);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildPlainTextEmail(data: ContactInput): string {
  const cleanName = sanitizeHeaderValue(data.name);
  const cleanEmail = sanitizeHeaderValue(data.email);
  return [
    "New Portfolio Enquiry",
    "",
    `Name: ${cleanName}`,
    `Email: ${cleanEmail}`,
    `Submitted at: ${new Date().toISOString()}`,
    "",
    "Message:",
    data.message,
  ].join("\n");
}

export function buildHtmlEmail(data: ContactInput): string {
  const safeName = escapeHtml(sanitizeHeaderValue(data.name));
  const safeEmail = escapeHtml(sanitizeHeaderValue(data.email));
  const safeMessage = escapeHtml(data.message).replace(/\n/g, "<br />");
  const submittedAt = new Date().toISOString();

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1b1b1b; background: #f6f3ee; padding: 24px;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #d9d3c9; border-radius: 12px; overflow: hidden;">
        <div style="padding: 20px 24px; border-bottom: 1px solid #e9e3d8; background: #f1eee8;">
          <div style="font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #4b5a4d; font-weight: 700;">Portfolio enquiry</div>
          <h2 style="margin: 8px 0 0; font-size: 24px; font-weight: 700; color: #161616;">New contact message</h2>
        </div>
        <div style="padding: 24px;">
          <p style="margin: 0 0 12px;"><strong>Name:</strong> ${safeName}</p>
          <p style="margin: 0 0 12px;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color: #2b4a30;">${safeEmail}</a></p>
          <p style="margin: 0 0 12px;"><strong>Submitted:</strong> ${submittedAt}</p>
          <div style="margin-top: 18px; padding-top: 18px; border-top: 1px solid #ebe3d7;">
            <p style="margin: 0 0 10px; font-weight: 700; color: #161616;">Message</p>
            <div style="white-space: pre-wrap; color: #2b2b2b;">${safeMessage}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export type SendContactResult =
  | { success: true; message: string }
  | { success: false; status: number; error: string; fieldErrors?: Record<string, string> };

interface ResendErrorResponse {
  name?: string;
  statusCode?: number | null;
  message?: string;
}

interface NodeException {
  code?: string | number | undefined;
  message?: string;
  name?: string;
}

function isNodeException(val: unknown): val is NodeException {
  return typeof val === "object" && val !== null && "code" in val;
}

function getErrorCode(exception: unknown): string {
  if (isNodeException(exception)) {
    const { code } = exception;
    if (typeof code === "string") {
      return code;
    }
  }
  return "";
}

function analyzeResendFailure(
  error: ResendErrorResponse | null | undefined,
  exception?: unknown,
): { status: number; clientMessage: string } {
  // Extract error details safely without logging sensitive payloads
  const errCode: string = getErrorCode(exception);
  const errMessage = error?.message || (exception instanceof Error ? exception.message : "") || "";
  const errName = error?.name || (exception instanceof Error ? exception.name : "");
  const statusCode = error?.statusCode ?? null;

  // Check for DNS or Network layer failures
  const isDnsError =
    errCode === "ENOTFOUND" ||
    errCode === "EAI_AGAIN" ||
    errMessage.includes("ENOTFOUND") ||
    errMessage.includes("EAI_AGAIN");

  const isConnError =
    errCode === "ECONNREFUSED" ||
    errCode === "ECONNRESET" ||
    errCode === "ETIMEDOUT" ||
    errMessage.includes("ECONNREFUSED") ||
    errMessage.includes("ECONNRESET") ||
    errMessage.includes("ETIMEDOUT") ||
    errMessage.includes("fetch failed") ||
    errMessage.includes("The request could not be resolved");

  const isTlsError =
    errCode.startsWith("ERR_TLS_") ||
    errCode.startsWith("DEPTH_ZERO_SELF_SIGNED_CERT") ||
    errMessage.includes("certificate") ||
    errMessage.includes("SSL") ||
    errMessage.includes("TLS");

  if (isDnsError) {
    console.error(
      `[Contact Diagnostic] Resend DNS resolution failure (code=${errCode || "ENOTFOUND"}): api.resend.com could not be resolved. Ensure host network connectivity or run outside an isolated network sandbox.`,
    );
    return {
      status: 503,
      clientMessage: "Service temporarily unavailable due to network DNS resolution failure.",
    };
  }

  if (isTlsError) {
    console.error(
      `[Contact Diagnostic] Resend TLS/SSL negotiation failure (code=${errCode || "TLS_ERR"}): Check local system certificates and proxy SSL settings.`,
    );
    return {
      status: 502,
      clientMessage: "Secure connection to email service failed. Please try again later.",
    };
  }

  if (isConnError) {
    console.error(
      `[Contact Diagnostic] Resend outbound connectivity error (code=${errCode || "CONN_ERR"}, name=${errName}): Outbound HTTPS connection to api.resend.com was refused or timed out.`,
    );
    return {
      status: 502,
      clientMessage: "The email could not be sent right now due to a network connection issue.",
    };
  }

  // Resend API validation or credential error
  if (statusCode === 401 || statusCode === 403) {
    console.error(
      `[Contact Diagnostic] Resend API authorization or domain rejection (status=${statusCode}, name=${errName}): ${errMessage}`,
    );
    return {
      status: 502,
      clientMessage:
        statusCode === 403
          ? "The email service rejected the sending domain or configuration."
          : "The email service authentication failed.",
    };
  }

  console.error(
    `[Contact Diagnostic] Resend API error (status=${statusCode ?? "unknown"}, name=${errName}): ${errMessage}`,
  );
  return {
    status: 502,
    clientMessage: "The email could not be sent right now. Please try again later.",
  };
}

/**
 * Race a promise against a timeout timer.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs = RESEND_TIMEOUT_MS): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error("Email provider request timed out.");
      (err as unknown as { code: string }).code = "ETIMEDOUT";
      reject(err);
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function processContactSubmission(rawBody: unknown): Promise<SendContactResult> {
  if (!rawBody || typeof rawBody !== "object") {
    return { success: false, status: 400, error: "Invalid request body." };
  }

  const result = contactSchema.safeParse(rawBody);
  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      success: false,
      status: 400,
      error: "Please check your details and try again.",
      fieldErrors,
    };
  }

  const validatedData = result.data;

  // Honeypot check - return generic error without revealing honeypot detection
  if (validatedData.website && validatedData.website.trim().length > 0) {
    return { success: false, status: 400, error: "Submission rejected." };
  }

  const apiKey = process.env["RESEND_API_KEY"];
  const fromEmail = process.env["CONTACT_FROM_EMAIL"];
  const toEmail = process.env["CONTACT_TO_EMAIL"];

  if (!apiKey || !fromEmail || !toEmail) {
    return { success: false, status: 500, error: "Email configuration is missing." };
  }

  try {
    const resend = new Resend(apiKey);
    const cleanName = sanitizeHeaderValue(validatedData.name);
    const cleanEmail = sanitizeHeaderValue(validatedData.email);

    const { data, error } = await withTimeout(
      resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        replyTo: cleanEmail,
        subject: `New Portfolio Enquiry — ${cleanName}`,
        html: buildHtmlEmail(validatedData),
        text: buildPlainTextEmail(validatedData),
      }),
      RESEND_TIMEOUT_MS,
    );

    if (error) {
      const diagnosis = analyzeResendFailure(error);
      return {
        success: false,
        status: diagnosis.status,
        error: diagnosis.clientMessage,
      };
    }

    if (!data?.id) {
      console.error("[Contact Diagnostic] Resend returned no error but no email ID");
      return {
        success: false,
        status: 502,
        error: "The email could not be verified as delivered. Please try again.",
      };
    }

    return {
      success: true,
      message: "Thanks — your message has been sent.",
    };
  } catch (err) {
    const diagnosis = analyzeResendFailure(null, err);
    return {
      success: false,
      status: diagnosis.status,
      error: diagnosis.clientMessage,
    };
  }
}
