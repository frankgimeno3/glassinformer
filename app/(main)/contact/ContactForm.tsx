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
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white text-gray-900";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 shadow-xl p-6 sm:p-8 rounded-2xl"
    >
      <div className="space-y-6">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-sm font-semibold text-gray-700 mb-2"
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
            className="block text-sm font-semibold text-gray-700 mb-2"
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
            className="block text-sm font-semibold text-gray-700 mb-2"
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
            className="block text-sm font-semibold text-gray-700 mb-2"
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

        <p className="text-sm text-gray-500">
          By sending this form, you acknowledge our{" "}
          <Link
            href="/legal/privacy-policy"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            privacy policy
          </Link>
          .
        </p>

        <button
          type="submit"
          className="w-full py-4 px-6 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
        >
          Send message
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
