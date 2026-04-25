"use client";

import { useState } from "react";

type ProductCardMediaProps = {
  category: string;
  icon?: string;
  iconText?: string;
  monogram: string;
  previewLabel?: string;
  serverLabel?: string;
  stockLabel?: string;
};

export function ProductCardMedia({
  category,
  icon,
  iconText,
  monogram,
  previewLabel,
  serverLabel,
  stockLabel,
}: ProductCardMediaProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(icon) && !imageFailed;

  return (
    <div className="relative flex min-h-[230px] items-end justify-between overflow-hidden bg-[#0a0a0a] px-5 py-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,transparent,rgba(2,6,23,0.6))]" />
      <div className="absolute -bottom-16 right-[-8%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.16),transparent_68%)] blur-2xl" />

      <div className="relative z-10 flex h-[132px] w-[102px] flex-col justify-between rounded-[1.35rem] border border-white/15 bg-white/[0.04] p-3 shadow-[0_0_20px_rgba(255,255,255,0.08)]">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/76">
          {serverLabel ?? "discord.gg/pending"}
        </span>

        <div className="flex min-h-[72px] flex-1 items-end">
          {showImage ? (
            <img
              src={icon}
              alt={previewLabel ?? category}
              className="h-16 w-16 rounded-xl object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                setImageFailed(true);
              }}
            />
          ) : (
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/44">
                {previewLabel}
              </span>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.08em] text-white">
                {iconText ?? monogram}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-[12rem] text-right">
        <span className="inline-flex rounded-full border border-white/12 bg-black/25 px-3 py-1 text-xs font-medium text-white/72 backdrop-blur">
          {stockLabel ?? "Live stock"}
        </span>
        <p className="mt-6 text-[2rem] font-semibold leading-none tracking-[-0.08em] text-white sm:text-[2.45rem]">
          {category}
        </p>
        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-white/42">
          /pending
        </p>
      </div>
    </div>
  );
}
