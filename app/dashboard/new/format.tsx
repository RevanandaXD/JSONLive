"use client";

import { useRef } from "react";

type FormatJSONProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  className?: string;
};

export const FormatJSON = ({
  value,
  onChange,
  placeholder = "",
  invalid = false,
  className = "",
}: FormatJSONProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const setCaret = (pos: number) => {
    requestAnimationFrame(() => {
      textAreaRef.current?.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const element = textAreaRef.current;
    if (!element) return;

    const start = element.selectionStart;
    const end = element.selectionEnd;
    const current = element.value;

    if (e.key === "Tab") {
      e.preventDefault();
      const indent = "  ";
      const next =
        current.slice(0, start) + indent + current.slice(end);
      onChange(next);
      setCaret(start + indent.length);
      return;
    }

    const pairs: Record<string, string> = { "{": "}", "[": "]", '"': '"' };
    if (pairs[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (start !== end) {
        e.preventDefault();
        const open = e.key;
        const close = pairs[e.key];
        const selected = current.slice(start, end);
        const next =
          current.slice(0, start) +
          open +
          selected +
          close +
          current.slice(end);
        onChange(next);
        requestAnimationFrame(() =>
          element.setSelectionRange(start + 1, start + 1 + selected.length),
        );
        return;
      }

      e.preventDefault();
      const open = e.key;
      const close = pairs[e.key];
      const next =
        current.slice(0, start) + open + close + current.slice(end);
      onChange(next);
      setCaret(start + 1);
      return;
    }

    if (e.key === "}" || e.key === "]" || e.key === '"') {
      if (current[start] === e.key) {
        e.preventDefault();
        setCaret(start + 1);
        return;
      }
    }
  };

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      spellCheck={false}
      className={`h-96 w-full resize-none bg-transparent p-5 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40 ${
        invalid ? "text-red-300" : "text-foreground"
      } ${className}`}
    />
  );
};
