"use client";

import Navbar from "../../components/shared/Navbar";
import Link from "next/link";
import { Shield, Lock, FileText, Scale, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-blue-600 selection:text-white">
      <Navbar />

      <div className="container mx-auto px-4 py-24 max-w-4xl">
        
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
            <div className="flex items-center gap-3 text-blue-500 mb-4">
                <Shield className="w-8 h-8" />
                <span className="font-bold tracking-widest uppercase text-sm">Legal Compliance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-gray-400 text-lg">
                Last Updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>

        {/* Content */}
        <div className="space-y-12 text-gray-300 leading-relaxed">
            
            {/* 1. Introduction */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    1. Introduction & Compliance
                </h2>
                <p className="mb-4">
                    NeneTickets ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard your personal data in accordance with the <strong>Constitution of Kenya, 2010</strong> (Article 31) and the <strong>Data Protection Act, 2019</strong>.
                </p>
                <p>
                    By using our platform, buying tickets, or hosting events, you consent to the data practices described in this policy. We act as a <strong>Data Controller</strong> for user accounts and a <strong>Data Processor</strong> on behalf of Event Organizers.
                </p>
            </section>

            {/* 2. Data We Collect */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Personal Data We Collect</h2>
                <p className="mb-4">To provide our ticketing services, we collect the following personal data:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Identity Data:</strong> Full name (as required for Ticket Validation).</li>
                    <li><strong>Contact Data:</strong> Phone number (mandatory for M-Pesa payments) and email address.</li>
                    <li><strong>Financial Data:</strong> M-Pesa transaction codes and payment status. <em>(Note: We do not store your PINs or bank login details).</em></li>
                    <li><strong>Technical Data:</strong> IP address, browser type, and device information for security and fraud prevention.</li>
                </ul>
            </section>

            {/* 3. M-Pesa & Payment Processing */}
            <section className="bg-green-900/10 border border-green-500/20 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" /> 3. M-Pesa & Financial Privacy
                </h2>
                <p className="mb-4">
                    When you choose to pay via M-Pesa, we transmit your phone number to Safaricom PLC solely to initiate the STK Push request.
                </p>
                <p>
                    <strong>Transaction Codes:</strong> We store M-Pesa Transaction Codes (e.g., QFH34...) for the purpose of validating payments and resolving support tickets. This data is retained for the statutory period required by Kenyan tax laws.
                </p>
            </section>

            {/* 4. How We Use Your Data */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Purpose of Processing</h2>
                <p className="mb-4">We process your data for the following lawful purposes:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <h3 className="font-bold text-white mb-2">Performance of Contract</h3>
                        <p className="text-sm">Issuing your ticket, validating entry at the venue, and processing payments.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <h3 className="font-bold text-white mb-2">Legal Obligation</h3>
                        <p className="text-sm">Fraud prevention, tax compliance, and cooperation with law enforcement.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <h3 className="font-bold text-white mb-2">Legitimate Interest</h3>
                        <p className="text-sm">Improving our platform, customer support, and "NeneCoins" loyalty tracking.</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <h3 className="font-bold text-white mb-2">Consent</h3>
                        <p className="text-sm">Sending marketing communications (which you can opt-out of at any time).</p>
                    </div>
                </div>
            </section>

            {/* 5. Sharing with Event Organizers */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Sharing Data with Event Organizers</h2>
                <p>
                    When you purchase a ticket, limited data (Your Name and Ticket ID) is shared with the <strong>Event Host</strong>. This is strictly for the purpose of:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                    <li>Verifying your identity at the door (Guest List).</li>
                    <li>Security and crowd control management.</li>
                </ul>
                <p className="mt-4 text-sm text-gray-400">
                    Event Organizers are bound by our Data Processing Agreement to not use your data for unauthorized marketing without your separate consent.
                </p>
            </section>

            {/* 6. Your Rights (DPA 2019) */}
            <section className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl">
                <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5" /> 6. Your Rights under Kenyan Law
                </h2>
                <p className="mb-4">Under the Data Protection Act 2019, you have the right to:</p>
                <ul className="space-y-3">
                    <li className="flex gap-3">
                        <div className="min-w-[6px] h-[6px] rounded-full bg-blue-500 mt-2"></div>
                        <span><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</span>
                    </li>
                    <li className="flex gap-3">
                        <div className="min-w-[6px] h-[6px] rounded-full bg-blue-500 mt-2"></div>
                        <span><strong>Right to Rectification:</strong> Ask us to correct false or misleading data (e.g., updating your phone number).</span>
                    </li>
                    <li className="flex gap-3">
                        <div className="min-w-[6px] h-[6px] rounded-full bg-blue-500 mt-2"></div>
                        <span><strong>Right to Erasure ("Right to be Forgotten"):</strong> Ask us to delete your personal data where there is no legal reason to keep it.</span>
                    </li>
                    <li className="flex gap-3">
                        <div className="min-w-[6px] h-[6px] rounded-full bg-blue-500 mt-2"></div>
                        <span><strong>Right to Object:</strong> Object to processing of all or part of your personal data.</span>
                    </li>
                </ul>
            </section>

            {/* 7. Contact Info */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Contact Data Controller</h2>
                <p className="mb-6">
                    If you wish to exercise any of your rights or have questions about this policy, please contact our Data Protection Officer:
                </p>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 w-fit">
                        <div className="bg-blue-600 p-3 rounded-full text-white">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-bold">Email Us</div>
                            <div className="text-white font-bold">privacy@nenetickets.co.ke</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 w-fit">
                        <div className="bg-gray-700 p-3 rounded-full text-white">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 uppercase font-bold">Office</div>
                            <div className="text-white font-bold">Nairobi, Kenya</div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
        
        {/* Footer Link */}
        <div className="mt-20 pt-8 border-t border-white/10 text-center">
            <Link href="/">
                <button className="text-gray-500 hover:text-white transition text-sm">
                    &larr; Back to Home
                </button>
            </Link>
        </div>

      </div>
    </main>
  );
}