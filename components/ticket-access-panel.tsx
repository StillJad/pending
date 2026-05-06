"use client";

import { useState } from "react";
import { Turnstile } from "@/components/turnstile";

export function TicketAccessPanel() {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const handleOpenTicket = async () => {
    if (!turnstileToken || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Verification failed. Try again.");
      }

      window.location.href = data.url;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Verification failed. Try again."
      );
      setTurnstileToken("");
      setResetKey((value) => value + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border-t border-white/5 pt-6">
      <p className="ui-overline">Verify</p>
      <p className="mt-3 text-sm leading-6 text-white/65">
        Complete verification before opening support.
      </p>

      <Turnstile
        className="mt-5"
        onVerify={(token) => {
          setTurnstileToken(token);

          if (token) {
            setError(null);
          }
        }}
        resetKey={resetKey}
      />

      {error ? (
        <p className="mt-4 text-sm text-white/80">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={handleOpenTicket}
        disabled={!turnstileToken || isSubmitting}
        className="mt-5 rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white"
      >
        {isSubmitting ? "Checking..." : "Open Discord ticket"}
      </button>

      <p className="mt-4 text-sm text-white/50">
        This only verifies access before redirecting you to Discord.
      </p>
    </div>
  );
}
