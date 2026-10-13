import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { FaGithub, FaInstagram, FaLinkedin, FaArrowLeft } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Thank You | JSONLive",
  description: "Thanks for stopping by and using JSONLive.",
};

type SocialLink = {
  id: number;
  name: string;
  icon: ReactNode;
  url: string;
};

const socialLinks: SocialLink[] = [
  {
    id: 1,
    name: "Instagram",
    icon: <FaInstagram className="h-4 w-4" />,
    url: "https://www.instagram.com/revananda2006",
  },
  {
    id: 2,
    name: "LinkedIn",
    icon: <FaLinkedin className="h-4 w-4" />,
    url: "https://www.linkedin.com/in/revananda-islami-pasha-367422350",
  },
  {
    id: 3,
    name: "GitHub",
    icon: <FaGithub className="h-4 w-4" />,
    url: "https://github.com/RevanandaXD",
  },
];

export default function Thanks() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-20 sm:py-28">
        <Link
          href="/"
          className="group mb-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <FaArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back
        </Link>

        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Thank You
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Thanks for using JSONLive
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Thanks for stopping by and giving JSONLive a try. I hope it helps
            your projects move faster. Happy building!
          </p>
        </div>

        <div className="mt-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Connect with me
          </p>
          <ul className="mt-3 flex items-center gap-2">
            {socialLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  aria-label={link.name}
                  title={link.name}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary"
                >
                  {link.icon}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
