"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  ariaLabel?: string;
  className?: string;
};

export function CopyButton({
  value,
  label,
  copiedLabel = "Copied!",
  ariaLabel = "Copy to clipboard",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors ${className} ${
        copied
          ? "border-primary/40 text-primary"
          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {copied ? <FiCheck className="h-3.5 w-3.5" /> : <FiCopy className="h-3.5 w-3.5" />}
      {label && <span className="text-xs">{copied ? copiedLabel : label}</span>}
    </button>
  );
}
