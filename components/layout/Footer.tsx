import Link from "next/link";
import { FiGithub, FiArrowUpRight } from "react-icons/fi";
import { Logo } from "./Logo";

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <Logo href="/" className="w-fit text-lg" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The simplest way to turn JSON into a usable API. Paste, save, and
              get a public endpoint.
            </p>
            <a
              href="https://github.com/RevanandaXD"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 border p-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground w-fit"
              aria-label="GitHub"
            >
              <FiGithub className="w-3.5 h-3.5" />
              Support Me
            </a>
          </div>

          {/* Navigate */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Navigate
            </h4>
            <div className="flex flex-col gap-2">
              <a
                href="#features"
                className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground w-fit"
              >
                Features
                <FiArrowUpRight className="w-3 h-3 opacity-0 transition-all duration-200 group-hover:opacity-60" />
              </a>
              <a
                href="#how-it-works"
                className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground w-fit"
              >
                How It Works
                <FiArrowUpRight className="w-3 h-3 opacity-0 transition-all duration-200 group-hover:opacity-60" />
              </a>
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground w-fit"
              >
                Dashboard
                <FiArrowUpRight className="w-3 h-3 opacity-0 transition-all duration-200 group-hover:opacity-60" />
              </Link>
            </div>
          </div>

          {/* Quick Start */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Get Started
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create your first JSON endpoint in seconds.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors duration-200 hover:text-primary-hover w-fit relative after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all hover:after:w-full"
            >
              Start now
              <FiArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} JSONLive. Open source project. Made By Revananda
        </div>
      </div>
    </footer>
  );
};
