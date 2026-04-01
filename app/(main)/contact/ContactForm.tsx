"use client";

import { FC, useState } from "react";
import Link from "next/link";

const ContactForm: FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form:", formData);
    alert("Thank you for your message. We will get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-base text-white placeholder-gray-400 outline-none transition-all duration-200 focus:border-gray-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-transparent p-0"
    >
      <div className="space-y-6">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-2 block text-sm font-semibold text-white"
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
            className={inputClass}
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="mb-2 block text-sm font-semibold text-white"
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
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="contact-subject"
            className="mb-2 block text-sm font-semibold text-white"
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
            className="mb-2 block text-sm font-semibold text-white"
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

        <p className="text-sm text-gray-300">
          By sending this form, you acknowledge our{" "}
          <Link
            href="/legal/privacy-policy"
            className="font-medium text-indigo-400 underline hover:text-indigo-300"
          >
            privacy policy
          </Link>
          .
        </p>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-lg bg-white px-6 py-4 font-semibold text-black transition-all duration-200 hover:bg-gray-300"
        >
          Send message
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
