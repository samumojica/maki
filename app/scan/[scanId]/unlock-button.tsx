"use client";

import { useEffect, useRef, useState } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Verdict } from "@/lib/types";

// Load Stripe once outside render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const PRICE_LABEL = "$9";

// ─── Speedometer ──────────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<
  Verdict,
  { angle: number; color: string; glow: string; label: string }
> = {
  poor: {
    angle: -90,
    color: "#ef4444",
    glow: "rgba(239, 68, 68, 0.5)",
    label: "Poor",
  },
  "needs-work": {
    angle: 0,
    color: "#ff9900",
    glow: "rgba(255, 153, 0, 0.5)",
    label: "Needs Work",
  },
  good: {
    angle: 60,
    color: "#a3cf3d",
    glow: "rgba(163, 207, 61, 0.5)",
    label: "Good",
  },
  excellent: {
    angle: 90,
    color: "#00cc66",
    glow: "rgba(0, 204, 102, 0.5)",
    label: "Excellent",
  },
};

export function Speedometer({ verdict, score }: { verdict: Verdict; score: number }) {
  const config = VERDICT_CONFIG[verdict];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const currentAngleRef = useRef(-90);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use device pixel ratio for sharpness
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const cx = W / 2;
    const cy = H * 0.82;
    const R = W * 0.42;

    const targetAngle = config.angle;
    const startAngle = currentAngleRef.current;
    const startTime = performance.now();
    const duration = 2000;

    function easeOutElastic(t: number): number {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    function draw(angle: number, currentScore: number) {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, W, H);

      // Arc path
      const arcStart = Math.PI;
      const arcEnd = 0;

      // Track Background
      ctx.beginPath();
      ctx.arc(cx, cy, R, arcStart, arcEnd);
      ctx.strokeStyle = "#f3f4f6";
      ctx.lineWidth = 24;
      ctx.lineCap = "round";
      ctx.stroke();

      // Gradient Fill
      const grad = ctx.createLinearGradient(cx - R, cy, cx + R, cy);
      grad.addColorStop(0, "#ff4d4d");
      grad.addColorStop(0.4, "#ff9900");
      grad.addColorStop(0.7, "#eab308");
      grad.addColorStop(1, "#00cc66");

      // Progress Arc
      const currentArcEnd = arcStart + ((angle + 90) / 180) * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, R, arcStart, Math.min(currentArcEnd, Math.PI * 2));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 24;
      ctx.lineCap = "round";
      ctx.stroke();

      // Score Text removed as requested - using badge in parent instead

      // Needle
      const needleCanvas = Math.PI + ((angle + 90) / 180) * Math.PI;
      const needleLen = R + 8;
      const needleX = cx + needleLen * Math.cos(needleCanvas);
      const needleY = cy + needleLen * Math.sin(needleCanvas);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(needleX, needleY);
      ctx.strokeStyle = config.color;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutElastic(t);
      
      const angle = startAngle + (targetAngle - startAngle) * eased;
      const currentScore = 0 + (score - 0) * eased;
      
      currentAngleRef.current = angle;
      draw(angle, currentScore);
      
      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [verdict, score, config]);

  return (
    <div className="relative flex flex-col items-center">
      <canvas
        ref={canvasRef}
        style={{ width: "220px", height: "160px" }}
        className="drop-shadow-sm"
      />
    </div>
  );
}

// ─── Checkout Modal ────────────────────────────────────────────────────────────

function CheckoutModal({
  scanId,
  onClose,
}: {
  scanId: string;
  onClose: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scanId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.details || data.error);
        setClientSecret(data.clientSecret);
      })
      .catch((err) => setError((err as Error).message));
  }, [scanId]);

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={handleBackdrop}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <p className="text-xs font-bold text-[#268ad8] uppercase tracking-[0.2em] mb-1">
              Unlock Full Access
            </p>
            <p className="text-2xl font-black text-[#282f42] tracking-tight">
              Get Your Report — {PRICE_LABEL}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-300 hover:text-gray-900 hover:bg-gray-100 transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 pb-8">
          {error && (
            <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 mb-6 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {!clientSecret && !error && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
              <div className="w-8 h-8 border-3 border-gray-100 border-t-[#268ad8] rounded-full animate-spin" />
              <span className="text-sm font-bold tracking-tight">Securing session...</span>
            </div>
          )}

          {clientSecret && (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )}

          <div className="mt-6 flex flex-col items-center gap-4 opacity-50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-widest">SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export default function UnlockButton({
  scanId,
  score,
}: {
  scanId: string;
  score: number;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-[#268ad8] text-white px-8 py-5 rounded-full text-xl font-black hover:bg-[#1e6fb0] transition-all shadow-xl shadow-[#268ad8]/30 hover:scale-[1.02] active:scale-[0.98]"
      >
        Unlock Full Report — {PRICE_LABEL}
      </button>

      {showModal && (
        <CheckoutModal scanId={scanId} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
