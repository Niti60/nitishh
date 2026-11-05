import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { contactSchema, countWords, submitContact, type ContactFormValues } from "../lib/contact";

const defaultValues: ContactFormValues = {
  name: "",
  email: "",
  message: "",
  website: "",
};

export function ContactSection() {
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues,
  });

  const watchedName = watch("name") ?? "";
  const watchedEmail = watch("email") ?? "";
  const watchedMessage = watch("message") ?? "";

  const nameWordCount = useMemo(() => countWords(watchedName), [watchedName]);
  const isNameOverWords = nameWordCount > 30;
  const isNameOverChars = watchedName.length > 200;
  const isEmailOverLimit = watchedEmail.length > 70;
  const isMessageOverLimit = watchedMessage.length > 1000;

  const hasLimitViolations =
    isNameOverWords || isNameOverChars || isEmailOverLimit || isMessageOverLimit;

  const isSending = submitState === "sending" || isSubmitting;
  const isSubmitDisabled = isSending || hasLimitViolations;

  const formStateLabel = useMemo(() => {
    if (isSending) return "Sending...";
    if (submitState === "success") return "Message sent";
    return "Send message";
  }, [isSending, submitState]);

  const onSubmit = async (values: ContactFormValues) => {
    if (isSending) return; // Prevent duplicate submissions

    setSubmitState("sending");
    setSubmitMessage("");

    try {
      await submitContact(values);
      setSubmitState("success");
      setSubmitMessage("Thanks — your message has been sent. I'll get back to you soon.");
      reset(defaultValues); // Only clear on confirmed success
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong while sending your message. Please try again.",
      );
      // Entered data is intentionally preserved on failure
    }
  };

  return (
    <section id="contact" className="border-t bg-surface">
      <div className="page-shell section-space">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="reveal max-w-xl">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-accent-strong">
              Get in touch
            </p>
            <h2 className="mt-4 font-serif text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.98] tracking-[-0.03em]">
              Have something in mind?
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Have a project, an opportunity, or just want to connect? I&apos;d love to hear from
              you.
            </p>
          </div>

          <form
            className="reveal grid gap-5 rounded-2xl border border-border bg-background p-4 shadow-sm sm:p-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-describedby={submitMessage ? "contact-status" : undefined}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-1">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="contact-name"
                    className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Name
                  </label>
                  <span
                    id="contact-name-counter"
                    aria-live="polite"
                    className={`font-mono text-[0.65rem] ${
                      isNameOverWords || isNameOverChars
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {nameWordCount} / 30 words
                    {isNameOverChars ? ` (${watchedName.length}/200 chars)` : ""}
                  </span>
                </div>
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "contact-name-counter contact-name-error" : "contact-name-counter"
                  }
                  className="contact-field"
                  {...register("name")}
                />
                {errors.name && (
                  <p id="contact-name-error" className="text-sm text-destructive" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2 sm:col-span-1">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="contact-email"
                    className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    Email
                  </label>
                  <span
                    id="contact-email-counter"
                    aria-live="polite"
                    className={`font-mono text-[0.65rem] ${
                      isEmailOverLimit ? "font-semibold text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {watchedEmail.length} / 70 characters
                  </span>
                </div>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email
                      ? "contact-email-counter contact-email-error"
                      : "contact-email-counter"
                  }
                  className="contact-field"
                  {...register("email")}
                />
                {errors.email && (
                  <p id="contact-email-error" className="text-sm text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="contact-message"
                  className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Message
                </label>
                <span
                  id="contact-message-counter"
                  aria-live="polite"
                  className={`font-mono text-[0.65rem] ${
                    isMessageOverLimit ? "font-semibold text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {watchedMessage.length.toLocaleString()} / 1,000 characters
                </span>
              </div>
              <textarea
                id="contact-message"
                rows={7}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={
                  errors.message
                    ? "contact-message-counter contact-message-error"
                    : "contact-message-counter"
                }
                className="contact-field contact-field--textarea"
                {...register("message")}
              />
              {errors.message && (
                <p id="contact-message-error" className="text-sm text-destructive" role="alert">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="hidden" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("website")}
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSending ? (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                ) : (
                  <ArrowRight aria-hidden className="size-4" />
                )}
                {formStateLabel}
              </button>

              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground">
                Usually replies within 24–48 hours
              </p>
            </div>

            {submitMessage ? (
              <div
                id="contact-status"
                className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
                  submitState === "success"
                    ? "border-accent/40 bg-accent/10 text-foreground"
                    : "border-destructive/40 bg-destructive/5 text-foreground"
                }`}
                role={submitState === "success" ? "status" : "alert"}
              >
                {submitState === "success" ? (
                  <CheckCircle2 aria-hidden className="mt-0.5 size-4 text-accent-strong" />
                ) : null}
                <span>{submitMessage}</span>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
