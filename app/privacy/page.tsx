import Navbar from "../../components/shared/Navbar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NeneTickets",
  description: "Read the Privacy Policy for NeneTickets — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  const lastUpdated = "1 May 2026";

  return (
    <main className="min-h-screen bg-[#050511] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-32 max-w-3xl">
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: {lastUpdated}</p>

        <div className="prose prose-invert max-w-none space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>NeneTickets Ltd (&quot;NeneTickets&quot;, &quot;we&quot;, &quot;us&quot;) is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights under the Kenya Data Protection Act, 2019.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-white">Contact information:</strong> Your name, email address, and phone number provided at checkout or account registration.</li>
              <li><strong className="text-white">Payment information:</strong> Transaction reference numbers and payment status. We do not store your card or M-Pesa PIN — payments are processed by Paystack.</li>
              <li><strong className="text-white">Ticket data:</strong> The events you purchase tickets for, ticket types, and quantities.</li>
              <li><strong className="text-white">Usage data:</strong> Pages visited, events viewed, and actions taken on the Platform (collected anonymously for analytics).</li>
              <li><strong className="text-white">Device data:</strong> Browser type, operating system, and IP address for security and fraud prevention.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Process your ticket purchases and send booking confirmations.</li>
              <li>Send your e-ticket and QR code via email and SMS.</li>
              <li>Communicate important updates about events you have booked (e.g. cancellations or venue changes).</li>
              <li>Prevent fraud and ensure platform security.</li>
              <li>Improve the Platform through aggregate, anonymised analytics.</li>
              <li>Comply with our legal obligations under Kenyan law.</li>
            </ul>
            <p className="mt-3">We do <strong className="text-white">not</strong> sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Sharing Your Information</h2>
            <p>We may share your personal data with:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-white">Event organisers:</strong> Your name, phone number, email, and ticket details are shared with the organiser of events you attend for check-in and attendee management purposes.</li>
              <li><strong className="text-white">Payment processors:</strong> Paystack receives transaction data necessary to process your payment. Paystack&apos;s privacy policy applies to their handling of your data.</li>
              <li><strong className="text-white">Service providers:</strong> We use Upstash (database), Vercel (hosting), and Clerk (authentication) to operate the Platform. These providers process data on our behalf under confidentiality agreements.</li>
              <li><strong className="text-white">Legal authorities:</strong> Where required by Kenyan law or a valid court order.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Retention</h2>
            <p>We retain your personal data for as long as necessary to provide the Platform services and comply with our legal obligations. Ticket and transaction records are retained for a minimum of 7 years as required by Kenyan tax law. You may request deletion of your account data at any time (see Section 7).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Cookies</h2>
            <p>The Platform uses essential cookies to maintain your session and authentication state. We use anonymised analytics cookies to understand how the Platform is used. You can disable non-essential cookies in your browser settings, though this may affect Platform functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Your Rights</h2>
            <p>Under the Kenya Data Protection Act, 2019, you have the right to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-white">Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong className="text-white">Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong className="text-white">Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
              <li><strong className="text-white">Objection:</strong> Object to processing of your data for marketing purposes.</li>
              <li><strong className="text-white">Portability:</strong> Request a copy of your data in a structured, machine-readable format.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:privacy@nenetickets.co.ke" className="text-blue-400 hover:underline">privacy@nenetickets.co.ke</a>. We will respond within 21 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Security</h2>
            <p>We implement industry-standard security measures to protect your data, including HTTPS encryption, secure database storage, and access controls. However, no method of transmission over the internet is 100% secure. If you believe your account has been compromised, contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Children&apos;s Privacy</h2>
            <p>The Platform is not directed at children under the age of 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the Platform. Continued use of the Platform after changes constitutes your acceptance of the updated Policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Contact Us</h2>
            <p>For privacy-related queries or to exercise your rights, contact our Data Protection Officer:</p>
            <div className="mt-3 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1 text-sm">
              <p className="font-bold text-white">NeneTickets Ltd — Data Protection Officer</p>
              <p>Nairobi, Kenya</p>
              <p>Email: <a href="mailto:privacy@nenetickets.co.ke" className="text-blue-400 hover:underline">privacy@nenetickets.co.ke</a></p>
              <p>Website: <Link href="/" className="text-blue-400 hover:underline">nenetickets.co.ke</Link></p>
            </div>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          <Link href="/support" className="hover:text-white transition">Support</Link>
          <Link href="/" className="hover:text-white transition">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
