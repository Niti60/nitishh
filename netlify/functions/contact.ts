import { handleContactWebRequest } from "../../src/lib/contact-service.ts";

export default async function handler(request: Request): Promise<Response> {
  return handleContactWebRequest(request);
}
