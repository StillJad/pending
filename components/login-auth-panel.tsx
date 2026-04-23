"use client";

import { useState } from "react";
import { Turnstile } from "@/components/turnstile";

type LoginAuthPanelProps = {
  inviteUrl: string;
  message: string | null;
  next: string;
  requiresGuildJoin: boolean;
};

export function LoginAuthPanel({
  inviteUrl,
  message,
  next,
  requiresGuildJoin,
}: LoginAuthPanelProps) {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const handleContinue = async () => {
    if (!turnstileToken || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      const response = await fetch("/api/auth/discord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          next,
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.url) {
        throw new Error(data?.error || "Verification failed. Try again.");
      }

      window.location.href = data.url;
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Verification failed. Try again."
      );
      setTurnstileToken("");
      setResetKey((value) => value + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
        Login
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
        Discord authentication
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/70">
        Use your Discord account to continue.
      </p>

      <Turnstile
        className="mt-6"
        onVerify={(token) => {
          setTurnstileToken(token);

          if (token) {
            setLocalError(null);
          }
        }}
        resetKey={resetKey}
      />

      {localError || message ? (
        <p className="mt-4 text-sm text-[#c4b5fd]">{localError || message}</p>
      ) : null}

      <div className="mt-6 flex flex-col items-start gap-3">
        {requiresGuildJoin ? (
          <a
            href={inviteUrl}
            target="_blank"
            rel="noreferrer"
            className="ui-button-secondary"
          >
            Join Discord server
          </a>
        ) : null}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!turnstileToken || isSubmitting}
          className="rounded-lg bg-[#8b5cf6] px-4 py-3 text-sm font-medium text-white transition hover:opacity-90 hover:shadow-[0_0_16px_rgba(139,92,246,0.22)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:shadow-none"
        >
          {isSubmitting ? "Checking..." : "Continue with Discord"}
        </button>
      </div>

      <p className="mt-5 text-sm text-white/50">
        We only use Discord to verify access.
      </p>
    </>
  );
}
