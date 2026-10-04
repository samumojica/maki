"use client";

import { useState } from "react";
import { PrivacyModal, TermsModal } from "../LegalModals";

export function LegalLinks() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setPrivacyOpen(true)} className="text-left hover:text-mint transition-colors">
        Privacy Policy
      </button>
      <button onClick={() => setTermsOpen(true)} className="text-left hover:text-mint transition-colors">
        Terms & Conditions
      </button>
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </>
  );
}
