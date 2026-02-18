import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal Notice | GlassInformer",
  description: "Legal notice and general information about GlassInformer.",
};

export default function LegalNoticePage() {
  return (
    <article className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Notice</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">1. Publisher &amp; responsible party</h2>
          <p>
            This website is operated by <strong>GlassInformer</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), a platform providing industry news, insights, and resources for the glass sector. For the purposes of the applicable legislation, the party responsible for the content of this website is GlassInformer.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">2. Purpose of the website</h2>
          <p>
            GlassInformer offers news articles, publications, a company and product directory, events information, and mediakit services. The site is intended for professionals and businesses in the glass industry and related sectors.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">3. Intellectual property</h2>
          <p>
            All content on this website (texts, images, logos, layout, and other materials) is protected by intellectual and industrial property rights. Unauthorised reproduction, distribution, or use without prior written consent is prohibited, except for personal and non-commercial use or where otherwise permitted by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4. Limitation of liability</h2>
          <p>
            We strive to keep the information on this site accurate and up to date. However, we do not guarantee the completeness, accuracy, or timeliness of the content. GlassInformer shall not be liable for any direct or indirect damages arising from the use of or reliance on the information provided on this website. Links to third-party sites are provided for convenience; we are not responsible for their content or practices.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">5. User-generated content &amp; conduct</h2>
          <p>
            Where users can post content (e.g. comments, profiles, or directory entries), they are responsible for ensuring that such content does not infringe third-party rights or applicable law. We reserve the right to remove content that we consider inappropriate or in breach of our terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">6. Governing law</h2>
          <p>
            These terms and the use of this website are governed by the laws applicable in the jurisdiction of GlassInformer. Any disputes shall be subject to the exclusive jurisdiction of the courts of that jurisdiction, unless otherwise required by mandatory law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-2">7. Contact</h2>
          <p>
            For any questions regarding this legal notice, please contact us through the contact options provided on the website (e.g. mediakit or general contact forms).
          </p>
        </section>
      </div>

      <nav className="mt-10 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Legal &amp; policies</p>
        <ul className="flex flex-wrap gap-4 text-sm">
          <li><Link href="/legal/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
          <li><Link href="/legal/cookie-policy" className="text-blue-600 hover:underline">Cookie Policy</Link></li>
          <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
        </ul>
      </nav>
    </article>
  );
}
