import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy | GlassInformer",
  description: "How GlassInformer uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <article className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">1. What are cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently, to remember your preferences, and to provide information to the site owners. GlassInformer uses cookies and similar technologies (e.g. local storage) in line with this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">2. Why we use cookies</h2>
          <p>We use cookies to:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Essential operation:</strong> Enable core features such as logging in, session management, security, and load balancing.</li>
            <li><strong>Preferences:</strong> Remember your settings (e.g. language, consent choices) so you do not have to set them again.</li>
            <li><strong>Analytics and performance:</strong> Understand how visitors use our site (e.g. which pages are most viewed, how long users stay) so we can improve content and usability.</li>
            <li><strong>Advertising (if applicable):</strong> Where we show ads or work with partners, cookies may be used to deliver relevant ads and measure their effectiveness. We will only use such cookies in line with your consent where required by law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">3. Types of cookies we use</h2>
          <div className="space-y-4 mt-2">
            <div>
              <h3 className="font-semibold text-gray-900">Strictly necessary cookies</h3>
              <p>
                These are required for the website to function (e.g. authentication, security, remembering your cookie preferences). They do not require your consent in many jurisdictions but you can block them via your browser (some features may then not work).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Functional / preference cookies</h3>
              <p>
                These remember choices you make (e.g. layout, language) to improve your experience. They are usually based on your consent or our legitimate interest in providing a consistent service.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analytics cookies</h3>
              <p>
                These help us understand how the site is used (e.g. number of visitors, popular pages). We may use first-party analytics or third-party tools; where these are not strictly necessary, we seek your consent where required.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Marketing / advertising cookies</h3>
              <p>
                If we use advertising or marketing cookies (including from third parties), they are used to show relevant ads and measure campaigns. We will only activate these with your consent where the law requires it.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4. Third-party cookies</h2>
          <p>
            Some cookies are set by third-party services we use (e.g. analytics, embedded content, or advertising partners). Their use is governed by their respective privacy and cookie policies. We recommend reviewing those policies and, where possible, managing your preferences via our cookie banner or your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">5. How long cookies last</h2>
          <p>
            Session cookies are deleted when you close your browser. Persistent cookies remain on your device for a set period (e.g. days, months) or until you delete them. The retention period depends on the purpose of the cookie; we keep cookie-related data only as long as necessary for those purposes or as required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">6. Managing and disabling cookies</h2>
          <p>
            You can control cookies in several ways:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><strong>Cookie banner / consent tool:</strong> When you first visit GlassInformer, you may be asked to accept or reject non-essential cookies. You can change your choices at any time via the link in the footer or in your account/settings if available.</li>
            <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies. Check your browser&apos;s &quot;Help&quot; or &quot;Settings&quot; for options. Blocking all cookies may affect how the site works.</li>
          </ul>
          <p className="mt-2">
            Disabling certain cookies may limit features such as staying logged in, personalised content, or analytics that help us improve the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">7. Updates</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in our practices, technology, or legal requirements. The &quot;Last updated&quot; date at the top will be revised when we do. We encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">8. More information</h2>
          <p>
            For details on how we process personal data collected via cookies, please see our <Link href="/legal/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>. For general legal information, see our <Link href="/legal/legal-notice" className="text-blue-600 hover:underline">Legal Notice</Link>. If you have questions about our use of cookies, please contact us through the website.
          </p>
        </section>
      </div>

      <nav className="mt-10 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Legal &amp; policies</p>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li><Link href="/legal/legal-notice" className="text-blue-600 hover:underline">Legal Notice</Link></li>
          <li><Link href="/legal/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
          <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
        </ul>
      </nav>
    </article>
  );
}
