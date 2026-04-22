"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/app/apiClient";

const ContactForm: FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLogged, setIsLogged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [submitError, setSubmitError] = useState<string>("");

  useEffect(() => {
    // If the user is logged in, prefill name + email from users_db via /api/v1/users/me.
    // This is best-effort: if no session, we keep the form empty.
    const prefillFromSession = async () => {
      try {
        const res = await fetch("/api/v1/users/me", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as any;
        const first = String(data?.userName ?? "").trim();
        const last = String(data?.userSurnames ?? "").trim();
        const email = String(data?.userEmail ?? data?.id_user ?? "").trim();
        const fullName = `${first} ${last}`.trim();

        setFormData((prev) => ({
          ...prev,
          name: prev.name.trim() ? prev.name : fullName,
          email: prev.email.trim() ? prev.email : email,
        }));
        setIsLogged(true);
      } catch {
        // Ignore; contact page must remain usable for unlogged visitors.
      }
    };
    prefillFromSession();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitState("idle");
    setSubmitError("");
    setIsSubmitting(true);
    (async () => {
      try {
        if (isLogged) {
          await apiClient.post("/api/v1/panel-tickets", {
            subject: formData.subject,
            message: formData.message,
          });
        } else {
          await apiClient.post("/api/v1/panel-tickets/public", {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
          });
        }
        setSubmitState("success");
      } catch (err: any) {
        setSubmitState("error");
        setSubmitError(
          err?.message || "Could not send the message. Please try again later."
        );
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-gray-400";
  const inputDisabledClass =
    "opacity-70 cursor-not-allowed bg-gray-100";

  if (submitState === "success") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          Thank you for your message.
        </h2>
        <p className="mt-2 text-sm text-gray-700">
          We will get back to you soon.
        </p>
        <button
          type="button"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
          onClick={() => {
            setSubmitState("idle");
            setSubmitError("");
            setPrivacyAccepted(false);
            setFormData((prev) => ({
              ...prev,
              subject: "",
              message: "",
              ...(isLogged ? {} : { name: "", email: "" }),
            }));
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-transparent p-0"
    >
      <div className="space-y-6">
        {submitState === "error" && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {submitError}
          </div>
        )}
        <div>
          <label
            htmlFor="contact-name"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contact-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            readOnly={isLogged}
            disabled={isLogged}
            className={`${inputClass} ${isLogged ? inputDisabledClass : ""}`}
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="contact-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            readOnly={isLogged}
            disabled={isLogged}
            className={`${inputClass} ${isLogged ? inputDisabledClass : ""}`}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="contact-subject"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="contact-subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="What is your inquiry about?"
          />
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className={`${inputClass} resize-y`}
            placeholder="Your message..."
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-950 focus:ring-blue-950"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            required
            disabled={isSubmitting}
          />
          <span>
            I acknowledge the{" "}
            <Link
              href="/legal/privacy-policy"
              className="font-medium text-blue-950 underline hover:text-blue-900"
            >
              privacy policy
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting || !privacyAccepted}
          className="w-full cursor-pointer rounded-lg bg-blue-950 px-6 py-4 font-semibold text-white transition-all duration-200 hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
