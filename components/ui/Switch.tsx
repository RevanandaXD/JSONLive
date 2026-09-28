"use client";

type SwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
  tone?: "primary" | "amber";
  className?: string;
};

export function Switch({
  checked,
  onChange,
  label,
  hint,
  tone = "primary",
  className = "",
}: SwitchProps) {
  const track = checked
    ? tone === "amber"
      ? "bg-amber-500"
      : "bg-primary"
    : "bg-border";

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          onClick={() => onChange(!checked)}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${track}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
              checked ? "left-[18px]" : "left-0.5"
            }`}
          />
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
