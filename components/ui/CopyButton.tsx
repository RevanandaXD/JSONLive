"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

export type CopyButtonVariant = "outline" | "ghost";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  ariaLabel?: string;
  variant?: CopyButtonVariant;
  className?: string;
};

export function CopyButton({
  value,
  label,
  copiedLabel = "Copied!",
  ariaLabel = "Copy to clipboard",
  variant = "outline",
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

  const shape =
    variant === "ghost"
      ? "rounded-sm"
      : "rounded-md border";

  const tone = copied
    ? variant === "ghost"
      ? "text-primary"
      : "border-primary/40 text-primary"
    : variant === "ghost"
      ? "text-muted-foreground hover:text-foreground"
      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 font-semibold transition-colors ${shape} ${tone} ${className}`}
    >
      {copied ? <FiCheck className="h-3.5 w-3.5" /> : <FiCopy className="h-3.5 w-3.5" />}
      {label && <span className="text-xs">{copied ? copiedLabel : label}</span>}
    </button>
  );
}
