import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or less."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254, "Email must be 254 characters or less."),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message must be 5,000 characters or less."),
  website: z.string().trim().max(1000).optional().default(""),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export type ContactFormData = ContactFormValues;

export type ContactApiSuccess = {
  success: true;
  message: string;
};

export type ContactApiError = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string>;
};

export async function submitContact(data: ContactFormData): Promise<{ message: string }> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      message: data.message,
      website: data.website ?? "",
    }),
  });

  let payload: ContactApiSuccess | ContactApiError | null = null;

  try {
    payload = (await response.json()) as ContactApiSuccess | ContactApiError;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string" && payload.error.length > 0
        ? payload.error
        : "Something went wrong while sending your message. Please try again.";
    throw new Error(message);
  }

  return {
    message:
      payload && typeof payload.message === "string" && payload.message.length > 0
        ? payload.message
        : "Thanks — your message has been sent.",
  };
}
