import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | GlassInformer",
  description: "How GlassInformer collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <article className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">1. Who we are</h2>
          <p>
            <strong>GlassInformer</strong> is a platform that provides industry news, articles, publications, a directory of companies and products, events, and mediakit services for the glass sector. We are committed to protecting your privacy and handling your personal data in a transparent and lawful way.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">2. Data we collect</h2>
          <p>We may collect and process the following types of data:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Account data:</strong> When you register or log in (e.g. email, name, password, profile details).</li>
            <li><strong>Usage data:</strong> How you use the site (pages visited, features used), including via cookies and similar technologies (see our <Link href="/legal/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</Link>).</li>
            <li><strong>Directory and content data:</strong> If you add or manage companies, products, or other content, we store the information you provide.</li>
            <li><strong>Communications:</strong> Messages you send to us (e.g. via contact or mediakit forms).</li>
            <li><strong>Technical data:</strong> IP address, browser type, device information, and similar data necessary for security and operation of the service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">3. How we use your data</h2>
          <p>We use your data to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Provide, maintain, and improve our services (articles, publications, directory, events, mediakit).</li>
            <li>Manage your account and authenticate you.</li>
            <li>Process your requests and communicate with you.</li>
            <li>Send you service-related or, where you have agreed, marketing communications (e.g. newsletters).</li>
            <li>Analyse usage to improve the website and user experience.</li>
            <li>Comply with legal obligations and protect our rights and those of our users.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4. Legal basis</h2>
          <p>
            We process personal data on the basis of: (a) your consent where required (e.g. newsletters, non-essential cookies); (b) performance of a contract (e.g. providing the services you signed up for); (c) our legitimate interests (e.g. security, analytics, improving our services); and (d) compliance with legal obligations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">5. Sharing and disclosure</h2>
          <p>
            We may share your data with service providers who assist us in operating the website (e.g. hosting, analytics, email delivery), under strict confidentiality and data-processing agreements. We do not sell your personal data. We may disclose data where required by law or to protect our rights and safety.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">6. Data retention</h2>
          <p>
            We retain your data only for as long as necessary to fulfil the purposes described in this policy, or as required by law. When you delete your account or request erasure, we will delete or anonymise your data in line with our procedures and legal obligations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">7. Your rights</h2>
          <p>
            Depending on your jurisdiction, you may have the right to: access your data, rectify it, request erasure, restrict processing, object to processing, data portability, and withdraw consent. You may also have the right to lodge a complaint with a supervisory authority. To exercise these rights, please contact us using the details provided on the website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">8. Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or misuse. No method of transmission over the internet is completely secure; we encourage you to use strong passwords and keep your account details confidential.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">9. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the revised version on this page and update the &quot;Last updated&quot; date. Continued use of the site after changes constitutes acceptance of the updated policy where permitted by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">10. Contact</h2>
          <p>
            For any questions about this Privacy Policy or our data practices, please contact us through the contact options available on the GlassInformer website.
          </p>
        </section>
      </div>

      <nav className="mt-10 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Legal &amp; policies</p>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li><Link href="/legal/legal-notice" className="text-blue-600 hover:underline">Legal Notice</Link></li>
          <li><Link href="/legal/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</Link></li>
          <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
        </ul>
      </nav>
    </article>
  );
}
