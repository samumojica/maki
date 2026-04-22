"use client";

import { useState } from "react";

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-[#282f42] mb-6">{title}</h2>
        <div className="prose prose-sm text-gray-600 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Privacy Policy">
      <p className="mb-4"><strong>Last updated:</strong> April 2026</p>
      <h3 className="text-base font-semibold text-[#282f42] mt-6 mb-2">What we collect</h3>
      <p className="mb-3">When you use Maki, we temporarily process the URL you submit to generate your performance report. We do not collect personal information, create user accounts, or require login credentials.</p>
      <h3 className="text-base font-semibold text-[#282f42] mt-6 mb-2">Payment processing</h3>
      <p className="mb-3">Payments are processed securely through Stripe. We never see or store your credit card details. Stripe&apos;s privacy policy applies to payment data.</p>
      <h3 className="text-base font-semibold text-[#282f42] mt-6 mb-2">Data retention</h3>
      <p className="mb-3">Your scan results are stored temporarily in memory for up to 30 minutes to complete the checkout flow. After that, all data is automatically deleted. We do not maintain a database of URLs or reports.</p>
      <h3 className="text-base font-semibold text-[#282f42] mt-6 mb-2">Third-party services</h3>
      <p className="mb-3">We use Google PageSpeed Insights API to fetch performance data and AI models to translate results into plain English. Your URL is sent to these services as part of the analysis.</p>
      <h3 className="text-base font-semibold text-[#282f42] mt-6 mb-2">Cookies</h3>
      <p className="mb-3">We do not use tracking cookies. Stripe may set essential cookies for payment processing.</p>
    </Modal>
  );
}

export function TermsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Terms & Conditions">
      <p className="mb-4"><strong>Last updated:</strong> April 2026</p>
      <h3 className="text-base font-semibold text-[#282f42] mt-6 mb-2">Service description</h3>
      <p className="mb-3">Maki provides automated website performance reports based on data from Google PageSpeed Insights. Reports are generated using AI to translate technical data into actionable recommendations.</p>
      <h3 className="text-base font-semibold text-[#282f42] mt-6 mb-2">One-time payment</h3>
      <p className="mb-3">All purchases are one-time payments. There are no subscriptions, recurring charges, or hidden fees. You pay once and receive your report immediately.</p>
      <h3 className="text-base font-semibold text-[#282f42] mt-6 mb-2">No Refunds</h3>
      <p className="mb-3">All sales are final. Due to the digital nature of our tailored reports and the immediate delivery of information, we do not offer refunds once a report has been generated and delivered.</p>
      <h3 className="text-base font-semibold text-[#282f42] mt-6 mb-2">Accuracy & Improvement Disclaimer</h3>
      <p className="mb-3">Performance data comes from Google&apos;s servers and may vary between scans. Implementing recommendations does not guarantee an immediate improvement in your Core Web Vitals scores, as Google&apos;s field data (CrUX) typically updates on a 28-day rolling cycle. Our AI-generated recommendations are suggestions based on available data and may not cover every scenario. We recommend consulting a web developer for complex fixes.</p>
      <h3 className="text-base font-semibold text-[#282f42] mt-6 mb-2">No affiliation</h3>
      <p className="mb-3">Maki is not affiliated with, endorsed by, or associated with Google, Alphabet Inc., GTmetrix, DebugBear, or any other third-party service mentioned on this site.</p>
      <h3 className="text-base font-semibold text-[#282f42] mt-6 mb-2">Limitation of liability</h3>
      <p className="mb-3">Maki is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages resulting from the use of our service or the implementation of our recommendations.</p>
    </Modal>
  );
}
