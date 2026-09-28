"use client";

import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { IconType } from "react-icons";
import { HiOutlineEye, HiOutlineEyeSlash } from "react-icons/hi2";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  className = "",
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function inputClasses({
  icon,
  mono = false,
  className = "",
}: {
  icon?: boolean;
  mono?: boolean;
  className?: string;
} = {}) {
  return [
    "w-full rounded-md border border-border bg-background py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary",
    icon ? "pl-10 pr-4" : "px-3.5",
    mono ? "font-mono" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: IconType;
  mono?: boolean;
  wrapperClassName?: string;
};

export function TextInput({
  icon: Icon,
  mono = false,
  wrapperClassName = "",
  className = "",
  ...props
}: TextInputProps) {
  if (!Icon) {
    return (
      <input
        className={inputClasses({ mono, className })}
        {...props}
      />
    );
  }

  return (
    <div className={`relative ${wrapperClassName}`}>
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <input
        className={inputClasses({ icon: true, mono, className })}
        {...props}
      />
    </div>
  );
}

export function PasswordInput({
  icon: Icon,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon?: IconType }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      )}
      <input
        type={visible ? "text" : "password"}
        className={inputClasses({ icon: true, className: `pr-11 ${className}` })}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? (
          <HiOutlineEyeSlash className="h-5 w-5" />
        ) : (
          <HiOutlineEye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
