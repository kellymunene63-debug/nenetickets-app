import Navbar from "../../components/shared/Navbar";
import Footer from "../../components/shared/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | NeneTickets",
  description: "Read the Terms of Service for NeneTickets — Kenya's event ticketing platform.",
};

export default function TermsPage() {
  const lastUpdated = "1 May 2026";

  return (
    <main className="min-h-screen bg-[#050511] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-32 max-w-3xl">
        <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-12">Last updated: {lastUpdated}</p>

        <div className="prose prose-invert max-w-none space-y-10 text-gray-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using NeneTickets (&quot;the Platform&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. NeneTickets is operated by NeneTickets Ltd, a company incorporated in Kenya.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Ticket Purchases</h2>
            <p>All ticket purchases are final. When you buy a ticket on NeneTickets, you are entering into a contract with the event organiser, not with NeneTickets. We act as a platform to facilitate the transaction. Tickets are non-transferable unless the organiser explicitly permits transfers.</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>You must provide accurate information at checkout, including your phone number and email address.</li>
              <li>A booking confirmation will be sent to your email and phone after successful payment.</li>
              <li>NeneTickets is not responsible for lost, stolen, or duplicate tickets resulting from the buyer sharing their ticket details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Payments</h2>
            <p>Payments are processed securely by Paystack. We accept M-Pesa and card payments. By completing a purchase, you authorise the charge of the stated amount to your selected payment method. NeneTickets does not store your payment card details.</p>
            <p className="mt-3">All prices are displayed in Kenyan Shillings (KES) and include any applicable service fees shown at checkout.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Refunds and Cancellations</h2>
            <p>Refund eligibility depends on the event organiser&apos;s policy. NeneTickets does not guarantee refunds unless the event is officially cancelled by the organiser.</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li><strong className="text-white">Event cancelled by organiser:</strong> You are entitled to a full refund of the ticket price. Refunds will be processed within 7–14 business days.</li>
              <li><strong className="text-white">Buyer cancellation:</strong> Tickets are generally non-refundable once purchased. Contact the organiser directly to discuss exceptions.</li>
              <li><strong className="text-white">Failed payment:</strong> If your payment fails but your account is charged, contact us at <a href="mailto:support@nenetickets.co.ke" className="text-blue-400 hover:underline">support@nenetickets.co.ke</a> immediately.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Event Organisers</h2>
            <p>Organisers who create events on NeneTickets agree to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Provide accurate event details including date, time, location, and ticket pricing.</li>
              <li>Honour all tickets sold through the Platform.</li>
              <li>Notify NeneTickets and ticket holders promptly of any event changes or cancellations.</li>
              <li>Comply with all applicable Kenyan laws, including those governing public gatherings and entertainment.</li>
            </ul>
            <p className="mt-3">NeneTickets reserves the right to remove events that violate these terms or applicable law without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Promo Codes</h2>
            <p>Promo codes are offered at our discretion and may be withdrawn at any time. Each code may have usage limits, expiry dates, or minimum purchase requirements. Promo codes cannot be combined, exchanged for cash, or applied retroactively to completed purchases.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Prohibited Conduct</h2>
            <p>You may not use NeneTickets to:</p>
            <ul className="list-disc pl-5 mt-3 space-y-2">
              <li>Purchase tickets for the purpose of reselling at inflated prices (ticket touting).</li>
              <li>Create fraudulent events or misrepresent event details.</li>
              <li>Use automated bots or scripts to purchase tickets.</li>
              <li>Attempt to circumvent payment, security, or access controls.</li>
            </ul>
            <p className="mt-3">Violations may result in account suspension and cancellation of orders without refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Intellectual Property</h2>
            <p>All content on the Platform, including the NeneTickets name, logo, design, and software, is the property of NeneTickets Ltd and is protected under Kenyan and international intellectual property law. You may not reproduce, distribute, or create derivative works without our prior written consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Limitation of Liability</h2>
            <p>NeneTickets is a technology platform. We are not the organiser of any event listed on the Platform and are not liable for the quality, safety, or delivery of any event. Our total liability to you for any claim arising from use of the Platform shall not exceed the amount you paid for the relevant ticket(s).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Governing Law</h2>
            <p>These Terms are governed by the laws of the Republic of Kenya. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kenya.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">11. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the Platform after changes constitutes your acceptance of the revised Terms. We will notify users of material changes via the Platform or email.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">12. Contact Us</h2>
            <p>If you have questions about these Terms, please contact us:</p>
            <div className="mt-3 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1 text-sm">
              <p className="font-bold text-white">NeneTickets Ltd</p>
              <p>Nairobi, Kenya</p>
              <p>Email: <a href="mailto:support@nenetickets.co.ke" className="text-blue-400 hover:underline">support@nenetickets.co.ke</a></p>
              <p>Website: <Link href="/" className="text-blue-400 hover:underline">nenetickets.co.ke</Link></p>
            </div>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link href="/support" className="hover:text-white transition">Support</Link>
          <Link href="/" className="hover:text-white transition">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
