"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileWidget = {
  remove: (widgetId: string) => void;
  render: (
    container: HTMLElement,
    options: {
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
      sitekey: string;
      theme: "dark" | "light" | "auto";
      "timeout-callback": () => void;
    }
  ) => string;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileWidget;
  }
}

type TurnstileProps = {
  className?: string;
  onVerify: (token: string) => void;
  resetKey?: number;
};

export function Turnstile({
  className,
  onVerify,
  resetKey = 0,
}: TurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    let cancelled = false;
    let pollId: number | null = null;
    let timeoutId: number | null = null;

    if (!siteKey) {
      onVerifyRef.current("");
      setError("Verification unavailable.");
      return undefined;
    }

    const mountWidget = () => {
      if (
        cancelled ||
        widgetIdRef.current ||
        !containerRef.current ||
        !window.turnstile
      ) {
        return;
      }

      setError(null);

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        callback: (token) => {
          setError(null);
          onVerifyRef.current(token);
        },
        "error-callback": () => {
          setError("Verification failed. Try again.");
          onVerifyRef.current("");
        },
        "expired-callback": () => {
          onVerifyRef.current("");
        },
        sitekey: siteKey,
        theme: "dark",
        "timeout-callback": () => {
          onVerifyRef.current("");
        },
      });
    };

    mountWidget();

    if (!widgetIdRef.current) {
      pollId = window.setInterval(() => {
        mountWidget();

        if (widgetIdRef.current && pollId) {
          window.clearInterval(pollId);
        }
      }, 250);

      timeoutId = window.setTimeout(() => {
        if (!widgetIdRef.current) {
          setError("Verification unavailable.");
        }

        if (pollId) {
          window.clearInterval(pollId);
        }
      }, 5000);
    }

    return () => {
      cancelled = true;

      if (pollId) {
        window.clearInterval(pollId);
      }

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (!widgetIdRef.current || !window.turnstile) {
      return;
    }

    setError(null);
    onVerifyRef.current("");
    window.turnstile.reset(widgetIdRef.current);
  }, [resetKey]);

  return (
    <div className={className}>
      <div ref={containerRef} />
      {error ? (
        <p className="mt-3 text-sm text-white/80">{error}</p>
      ) : null}
    </div>
  );
}
