"use client";

import { useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";

export function PublicCopyButton({ endpoint }: { endpoint: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy endpoint"
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 transition-colors ${
        copied
          ? "border-primary/40 text-primary"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
    </button>
  );
}