import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleContactWebRequest } from "../src/lib/contact-service.ts";

export default async function handler(
  request: Request | VercelRequest,
  response?: VercelResponse,
): Promise<Response | void> {
  // If invoked with a standard web Request (Vercel Edge or Web runtime)
  if (
    request instanceof Request ||
    (request && typeof (request as unknown as Request).arrayBuffer === "function")
  ) {
    return handleContactWebRequest(request as unknown as Request);
  }

  // If invoked as standard Node.js Vercel Function (VercelRequest, VercelResponse)
  const req = request as VercelRequest;
  const res = response as VercelResponse;

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = `${protocol}://${host}${req.url || "/api/contact"}`;

  const headers = new Headers();
  for (const [key, val] of Object.entries(req.headers)) {
    if (Array.isArray(val)) {
      for (const v of val) headers.append(key, v);
    } else if (val !== undefined) {
      headers.set(key, val);
    }
  }

  const reqInit: RequestInit = {
    method: req.method || "POST",
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    reqInit.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
  }

  const webRequest = new Request(url, reqInit);
  const webResponse = await handleContactWebRequest(webRequest);

  res.status(webResponse.status);
  webResponse.headers.forEach((val, key) => {
    res.setHeader(key, val);
  });

  const responseText = await webResponse.text();
  try {
    const json: unknown = JSON.parse(responseText);
    res.json(json);
  } catch {
    res.send(responseText);
  }
}
