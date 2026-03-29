import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact | GlassInformer",
  description: "Contact GlassInformer — send us a message or inquiry.",
};

export default function ContactPage() {
  return (
    <article className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact</h1>
      <p className="text-gray-600 mb-8">
        Have a question or suggestion? Fill in the form below and we will
        respond as soon as we can.
      </p>
      <ContactForm />
    </article>
  );
}
