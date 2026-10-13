import type { Metadata } from "next";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Alert } from "@/components/ui/Alert";
import { LIMITS, MAX_API_KEYS, RATE_LIMIT } from "@/src/lib/config";

export const metadata: Metadata = {
  title: "Policy & Acceptable Use | JSONLive",
  description:
    "Acceptable use, limits, and privacy terms for the JSONLive mock API service.",
};

type PolicySection = {
  id: string;
  title: string;
  points: string[];
};

const SECTIONS: PolicySection[] = [
  {
    id: "data",
    title: "Data & Accounts",
    points: [
      "JSONLive stores your name, email address, and the JSON documents you publish.",
      "Passwords are stored as hashes, never as plain text.",
      "API keys are shown once at creation and stored only as a hash.",
      "Do not store secrets, passwords, tokens, or real user data in a resource.",
    ],
  },
  {
    id: "access",
    title: "Public Access & CORS",
    points: [
      "Published resources can be read by anyone who has the URL.",
      "Responses include Access-Control-Allow-Origin: * so any origin can fetch them.",
      "Private resources require an API key owned by the resource owner.",
      "Write requests (POST, PUT, PATCH, DELETE) always require an API key.",
    ],
  },
  {
    id: "rate-limits",
    title: "Rate Limits",
    points: [
      `GET requests are limited to ${RATE_LIMIT.GET.limit} per minute per IP address.`,
      `Write requests are limited to ${RATE_LIMIT.WRITE.limit} per minute per IP address.`,
      "When a limit is exceeded the API returns 429 with a Retry-After header.",
      "Scraping, load testing, and denial-of-service attempts are not permitted.",
    ],
  },
  {
    id: "storage",
    title: "Storage Limits",
    points: [
      `Each resource may contain up to ${(LIMITS.MAX_JSON_SIZE / (1024 * 1024)).toFixed(0)} MB of JSON.`,
      `An account may hold up to ${LIMITS.MAX_RESOURCES} resources.`,
      `An account may hold up to ${MAX_API_KEYS} API keys.`,
      "JSONLive is intended for development and testing. Keep your own backups.",
    ],
  },
  {
    id: "security",
    title: "Security",
    points: [
      "Traffic is served over HTTPS through a Cloudflare Tunnel.",
      "PostgreSQL is not exposed to the internet.",
      "Credentials are kept in environment variables.",
      "Resources are scoped to their owner and request bodies are validated.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    points: [
      "Do not upload illegal, harmful, or infringing content.",
      "Do not distribute malware, phishing pages, or spam payloads.",
      "Do not attempt to bypass authentication or access another account's resources.",
      "Content that violates these rules may be removed and accounts suspended.",
    ],
  },
  {
    id: "availability",
    title: "Availability & Retention",
    points: [
      "The service is self-hosted and provided without an uptime guarantee.",
      "It is not intended for production-critical systems.",
      "Inactive or abandoned test resources may be deleted periodically.",
    ],
  },
  {
    id: "deletion",
    title: "Account Deletion",
    points: [
      "You can delete your account from Settings at any time.",
      "Deleting an account removes its resources and API keys.",
      "You can edit or delete any resource you own at any time.",
    ],
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    points: [
      "This policy may change as the project evolves.",
      "Updates take effect when they are published on this page.",
    ],
  },
];

function Points({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
      {items.map((point, idx) => (
        <li key={idx} className="flex gap-2.5">
          <span
            aria-hidden
            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50"
          />
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PolicyPage() {
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
            Policy & Terms
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Policy & Acceptable Use
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            How JSONLive stores data, secures endpoints, and what is expected
            from users of the service.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">Version 2.0</p>
        </div>

        <Alert tone="warning" title="Development & testing" className="mt-8 max-w-2xl">
          JSONLive endpoints are public. Do not upload production secrets or
          confidential data.
        </Alert>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24 rounded-lg border border-border/70 bg-card/40 p-5"
            >
              <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
                {section.title}
              </h2>
              <div className="mt-3">
                <Points items={section.points} />
              </div>
            </section>
          ))}

          <section
            id="contact"
            className="scroll-mt-24 rounded-lg border border-border/70 bg-card/40 p-5 md:col-span-2 lg:col-span-3"
          >
            <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
              Contact
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              For questions or to report abuse, reach out through the{" "}
              <a
                href="https://github.com/RevanandaXD"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                GitHub project
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
