import { animate } from "motion";

export type Theme = "light" | "dark";

export type ThemeOrigin = { x: number; y: number };

export const THEME_STORAGE_KEY = "jsonlive-theme";
export const THEME_EVENT = "jsonlive:theme-change";

const REVEAL_DURATION = 0.5;
const REVEAL_TILE_DELAY = 0.01;
const GRID_COLS = 12;
const GRID_ROWS = 8;
const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const REVEAL_BACKGROUND: Record<Theme, string> = {
  light: "#fafafa",
  dark: "#09090b",
};

let activeReveal = 0;

export function getActiveTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

function swapTheme(root: HTMLElement, theme: Theme): void {
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme !== "light");
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme }));
}

function revealFrom(theme: Theme, commit: () => void, origin?: ThemeOrigin): void {
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;

  document
    .querySelectorAll("[data-theme-reveal-overlay]")
    .forEach((node) => node.remove());

  const id = ++activeReveal;
  const overlay = document.createElement("div");
  overlay.setAttribute("data-theme-reveal-overlay", "");
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "2147483647";
  overlay.style.pointerEvents = "none";
  overlay.style.overflow = "hidden";

  const tileW = window.innerWidth / GRID_COLS;
  const tileH = window.innerHeight / GRID_ROWS;
  const tiles: HTMLElement[] = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const tile = document.createElement("div");
      tile.style.position = "absolute";
      tile.style.left = `${c * tileW}px`;
      tile.style.top = `${r * tileH}px`;
      tile.style.width = `${tileW}px`;
      tile.style.height = `${tileH}px`;
      tile.style.background = REVEAL_BACKGROUND[theme];
      tile.style.transform = "scale(0)";
      tile.style.willChange = "transform";
      tile.style.transformOrigin = "center";

      const cx = c * tileW + tileW / 2;
      const cy = r * tileH + tileH / 2;
      const dist = Math.hypot(cx - x, cy - y);
      const delay = dist / Math.max(window.innerWidth, window.innerHeight);

      overlay.appendChild(tile);
      tiles.push(tile);

      animate(
        tile,
        { scale: [0, 1] },
        {
          duration: REVEAL_DURATION,
          ease: REVEAL_EASE,
          delay: delay * 0.25 + Math.random() * REVEAL_TILE_DELAY,
          reduceMotion: false,
        },
      );
    }
  }

  document.body.appendChild(overlay);

  const maxDelay = 0.25 + REVEAL_TILE_DELAY;
  const total = REVEAL_DURATION + maxDelay;

  const finish = () => {
    if (id !== activeReveal) {
      overlay.remove();
      return;
    }
    commit();
    overlay.remove();
  };

  window.setTimeout(finish, total * 1000);
}

export function applyTheme(theme: Theme, origin?: ThemeOrigin): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures (private mode / disabled storage)
  }

  const commit = () => swapTheme(root, theme);

  revealFrom(theme, commit, origin);
}
