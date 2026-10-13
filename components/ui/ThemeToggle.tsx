"use client";

import { HiOutlineMoon, HiOutlineSun } from "react-icons/hi2";
import { useTheme } from "@/hooks/useTheme";

export const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();

  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      className={`flex cursor-pointer items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-muted ${className}`}
    >
      {dark ? (
        <HiOutlineSun className="h-5 w-5" />
      ) : (
        <HiOutlineMoon className="h-5 w-5" />
      )}
    </button>
  );
};
