"use client";

import { FiSearch, FiX } from "react-icons/fi";
import { TextInput } from "./Input";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  ariaLabel = "Search",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <TextInput
        icon={FiSearch}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="pr-10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
