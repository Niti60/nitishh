import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Resend } from "resend";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(5000),
  website: z.string().trim().max(1000).default(""),
});

const MAX_BODY_SIZE = 32 * 1024;

function jsonError(response: VercelResponse, status: number, error: string) {
  response.status(status).json({ success: false, error });
}

function isValidOrigin(origin: string | undefined) {
  if (!origin) return true;

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "https://nitishyadav.com",
  ];

  return allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPlainTextEmail(data: z.infer<typeof schema>) {
  return [
    "New Portfolio Enquiry",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Submitted at: ${new Date().toISOString()}`,
    "",
    "Message:",
    data.message,
  ].join("\n");
}

function buildHtmlEmail(data: z.infer<typeof schema>) {
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
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

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    return jsonError(response, 405, "Method not allowed.");
  }

  const origin = request.headers.origin;
  if (origin && !isValidOrigin(origin)) {
    return jsonError(response, 403, "Origin not allowed.");
  }

  const { body } = request;
  const contentLength = Number(request.headers["content-length"] ?? 0);
  if (contentLength > MAX_BODY_SIZE) {
    return jsonError(response, 413, "Payload too large.");
  }

  if (!body || typeof body !== "object") {
    return jsonError(response, 400, "Invalid request body.");
  }

  let parsedBody: unknown;
  try {
    parsedBody = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  } catch {
    return jsonError(response, 400, "Invalid JSON payload.");
  }

  const result = schema.safeParse(parsedBody);
  if (!result.success) {
    return jsonError(response, 400, "Please check your details and try again.");
  }

  const validatedData = result.data;

  if (validatedData.website && validatedData.website.trim().length > 0) {
    return jsonError(response, 400, "Submission rejected.");
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!apiKey || !fromEmail || !toEmail) {
    return jsonError(response, 500, "Email configuration is missing.");
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: validatedData.email,
      subject: `New Portfolio Enquiry — ${validatedData.name}`,
      html: buildHtmlEmail(validatedData),
      text: buildPlainTextEmail(validatedData),
    });

    if (error) {
      return jsonError(response, 502, "The email could not be sent right now.");
    }

    return response.status(200).json({
      success: true,
      message: "Thanks — your message has been sent.",
    });
  } catch {
    return jsonError(response, 500, "The email could not be sent right now.");
  }
}
