import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact | GlassInformer",
  description: "Contact GlassInformer — send us a message or inquiry.",
};

export default function ContactPage() {
  return (
    <section className="w-full px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <article className="mx-auto w-full max-w-4xl px-2 sm:px-0">
        <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">Contact us</h1>
        <p className="mb-8 text-sm leading-6 text-gray-700 sm:text-base">
          Have a question or suggestion? Fill in the form below and we will
          respond as soon as we can.
        </p>
        <ContactForm />
      </article>
    </section>
  );
}
