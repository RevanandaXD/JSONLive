import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { CopyButton } from "@/components/ui/CopyButton";
import { CodeTabs } from "@/components/ui/CodeTabs";
import { LIMITS, MAX_API_KEYS, RATE_LIMIT } from "@/src/lib/config";
import {
  AUTH_EXAMPLES,
  BASE_URL,
  BEHAVIOR_NOTES,
  COLLECTION_ENDPOINTS,
  CONSUME_EXAMPLE,
  EXAMPLES,
  ITEM_ENDPOINTS,
  SAMPLE_DATA,
  STATUS_CODES,
  type Endpoint,
} from "@/src/lib/docs";
import {
  DocsSectionNav,
  DocsSidebar,
  type DocsNavGroup,
} from "@/components/layout/DocsSidebar";

export const metadata: Metadata = {
  title: "API Reference | JSONLive",
  description:
    "REST API reference for JSONLive resources — read, create, replace, update, and delete JSON over plain HTTP.",
};

const SIDEBAR_GROUPS: DocsNavGroup[] = [
  {
    group: "Getting Started",
    items: [
      { id: "overview", label: "Overview" },
      { id: "authentication", label: "Authentication" },
      { id: "quickstart", label: "Quickstart" },
    ],
  },
  {
    group: "Endpoints",
    items: [
      { id: "collection-routes", label: "Collections" },
      { id: "item-routes", label: "Item Routes" },
    ],
  },
  {
    group: "Tutorial",
    items: [
      { id: "starter-data", label: "Sample Dataset" },
      { id: "examples", label: "CRUD Operations" },
    ],
  },
  {
    group: "Reference",
    items: [
      { id: "notes", label: "Behavior Notes" },
      { id: "limits", label: "Limits & Quotas" },
      { id: "status-codes", label: "Status Codes" },
    ],
  },
];

const LIMITS_LIST = [
  { label: "Read requests", value: `${RATE_LIMIT.GET.limit} / min` },
  { label: "Write requests", value: `${RATE_LIMIT.WRITE.limit} / min` },
  {
    label: "JSON per resource",
    value: `${(LIMITS.MAX_JSON_SIZE / (1024 * 1024)).toFixed(0)} MB`,
  },
  { label: "Resources per user", value: `${LIMITS.MAX_RESOURCES}` },
  { label: "API keys per user", value: `${MAX_API_KEYS}` },
];

const METHOD_COLOR: Record<string, string> = {
  GET: "text-emerald-500",
  POST: "text-sky-500",
  PUT: "text-amber-500",
  PATCH: "text-violet-500",
  DELETE: "text-red-500",
  OPTIONS: "text-muted-foreground",
};

function MethodTag({ method }: { method: string }) {
  return (
    <span
      className={`font-mono text-[11px] font-bold tracking-wide ${
        METHOD_COLOR[method] ?? "text-muted-foreground"
      }`}
    >
      {method}
    </span>
  );
}

function Section({
  id,
  index,
  title,
  lead,
  children,
}: {
  id: string;
  index: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border/40 pt-10">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-primary/70">{index}</span>
        <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
      </div>

      {lead && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {lead}
        </p>
      )}

      <div className="mt-6">{children}</div>
    </section>
  );
}

function CodeBlock({ code, muted = false }: { code: string; muted?: boolean }) {
  return (
    <pre
      className={`overflow-x-auto px-4 py-3.5 font-mono text-xs leading-relaxed sm:text-[13px] ${
        muted ? "text-muted-foreground" : "text-foreground/90"
      }`}
    >
      <code>{code}</code>
    </pre>
  );
}

function CodePanel({ code }: { code: string }) {
  return (
    <div className="bg-muted/25">
      <div className="flex items-center justify-end border-b border-border/40 px-3 py-1.5">
        <CopyButton
          value={code}
          ariaLabel="Copy code"
          variant="ghost"
          className="h-6 px-1.5 text-[11px]"
        />
      </div>
      <CodeBlock code={code} />
    </div>
  );
}

function RouteTable({ items }: { items: Endpoint[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse">
        <thead>
          <tr className="border-b border-border/60 text-left">
            <th className="py-2.5 pr-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              Method
            </th>
            <th className="py-2.5 pr-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              Route
            </th>
            <th className="py-2.5 pr-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              Auth
            </th>
            <th className="py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((endpoint) => (
            <tr
              key={`${endpoint.method}-${endpoint.path}`}
              className="border-b border-border/25 transition-colors last:border-0 hover:bg-muted/20"
            >
              <td className="py-3.5 pr-5 align-top">
                <MethodTag method={endpoint.method} />
              </td>
              <td className="py-3.5 pr-5 align-top">
                <code className="font-mono text-xs text-foreground">
                  {endpoint.path}
                </code>
              </td>
              <td className="py-3.5 pr-5 align-top">
                {endpoint.auth === "key" ? (
                  <span className="font-mono text-[11px] text-amber-500">
                    Key
                  </span>
                ) : (
                  <span className="font-mono text-[11px] text-muted-foreground/50">
                    —
                  </span>
                )}
              </td>
              <td className="py-3.5 align-top">
                <p className="text-[13px] text-muted-foreground">
                  {endpoint.desc}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/50">
                  {endpoint.status}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />

      {/* Mobile section switcher */}
      <div className="sticky top-16 z-30 border-b border-border/50 bg-background/95 px-4 backdrop-blur sm:px-6 md:hidden">
        <DocsSectionNav groups={SIDEBAR_GROUPS} />
      </div>

      <div className="mx-auto flex w-full max-w-6xl gap-10 px-4 sm:px-6">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-56 shrink-0 overflow-y-auto py-12 md:block">
          <DocsSidebar groups={SIDEBAR_GROUPS} />
        </aside>

        <main className="min-w-0 flex-1 space-y-12 py-12">
          <header id="overview" className="scroll-mt-24">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              API Reference
            </p>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Turn JSON into a live HTTP API
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Every published resource generates an instant HTTP endpoint. Read
              operations require no authentication and have open CORS, while
              write mutations are secured with your API key.
            </p>

            <div className="mt-8 border-y border-border/40">
              <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                    Base URL
                  </p>
                  <p className="mt-1 break-all font-mono text-sm text-foreground">
                    {BASE_URL}
                  </p>
                </div>
                <CopyButton
                  value={BASE_URL}
                  ariaLabel="Copy base URL"
                  variant="ghost"
                  className="h-8 self-start px-2 text-xs sm:self-auto"
                />
              </div>
              <p className="pb-4 text-xs text-muted-foreground">
                All routes accept and return JSON (
                <code className="font-mono text-foreground">
                  application/json
                </code>
                ).
              </p>
            </div>
          </header>

          {/* Authentication */}
          <Section
            id="authentication"
            index="01"
            title="Authentication"
            lead="Reads (GET) are public and need no authentication. All write operations (POST, PUT, PATCH, DELETE) require an API key."
          >
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                  Read (GET)
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  No authentication or headers needed. Browsers can query
                  endpoints directly from any origin.
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                  Write (POST, PUT, PATCH, DELETE)
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  Send a key with every write request, using either header form.
                  Requests without a valid key return{" "}
                  <code className="font-mono text-foreground">
                    401 Unauthorized
                  </code>
                  .
                </p>

                <div className="mt-3 divide-y divide-border/25 border-y border-border/25">
                  {AUTH_EXAMPLES.map((example) => (
                    <div
                      key={example.label}
                      className="flex items-center justify-between gap-3 py-2"
                    >
                      <code className="font-mono text-xs text-foreground">
                        {example.code}
                      </code>
                      <span className="shrink-0 text-[11px] text-muted-foreground/60">
                        {example.label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-[13px] text-muted-foreground">
                  Get a key in{" "}
                  <Link
                    href="/settings"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Account Settings
                  </Link>
                  .
                </p>
              </div>
            </div>
          </Section>

          {/* Quickstart */}
          <Section
            id="quickstart"
            index="02"
            title="Quickstart"
            lead="Use standard fetch in any browser or JavaScript runtime:"
          >
            <CodePanel code={CONSUME_EXAMPLE} />
          </Section>

          {/* Collection Routes */}
          <Section
            id="collection-routes"
            index="03"
            title="Collection Routes"
            lead="Endpoints that operate on the whole resource dataset."
          >
            <RouteTable items={COLLECTION_ENDPOINTS} />
          </Section>

          {/* Item Routes */}
          <Section
            id="item-routes"
            index="04"
            title="Item Routes"
            lead="Endpoints targeting a specific item in an array resource by its id."
          >
            <RouteTable items={ITEM_ENDPOINTS} />
          </Section>

          {/* Sample Data */}
          <Section
            id="starter-data"
            index="05"
            title="Sample Dataset"
            lead="The CRUD examples below use a resource named users owned by revan."
          >
            <CodePanel code={SAMPLE_DATA} />
          </Section>

          {/* CRUD Tutorial */}
          <Section
            id="examples"
            index="06"
            title="CRUD Operations"
            lead="Follow these operations sequentially to explore how data updates over HTTP."
          >
            <div className="divide-y divide-border/30 border-y border-border/30">
              {EXAMPLES.map((example) => (
                <article key={example.step} className="py-6 first:pt-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-primary/70">
                      {example.step.padStart(2, "0")}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">
                      {example.title}
                    </h3>
                  </div>

                  <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                    {example.summary}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <MethodTag method={example.method} />
                    <code className="min-w-0 break-all font-mono text-xs text-foreground">
                      {example.path}
                    </code>
                  </div>

                  {example.note && (
                    <p className="mt-3 flex items-start gap-2 text-xs text-amber-500">
                      <HiOutlineExclamationTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {example.note}
                    </p>
                  )}

                  <div className="mt-4">
                    <CodeTabs
                      items={[
                        { value: "curl", label: "cURL", code: example.curl },
                        {
                          value: "js",
                          label: "JavaScript",
                          code: example.js,
                        },
                      ]}
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Response</span>
                      <span className="font-mono font-medium text-foreground">
                        {example.status}
                      </span>
                    </div>
                    <div className="mt-1.5 bg-muted/25">
                      <CodeBlock code={example.response} muted />
                    </div>
                    {example.result && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {example.result}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </Section>

          {/* Behavior Notes */}
          <Section
            id="notes"
            index="07"
            title="Behavior Notes"
            lead="The rules that decide how JSONLive stores and returns your data."
          >
            <div className="divide-y divide-border/25 border-y border-border/25">
              {BEHAVIOR_NOTES.map((note) => (
                <div
                  key={note.title}
                  className="grid gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-8"
                >
                  <p className="text-[13px] font-medium text-foreground">
                    {note.title}
                  </p>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {note.body}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Limits */}
          <Section
            id="limits"
            index="08"
            title="Limits & Quotas"
            lead="Fair-use limits that keep the endpoint fast and stable."
          >
            <div className="grid gap-x-10 sm:grid-cols-2">
              {LIMITS_LIST.map((limit) => (
                <div
                  key={limit.label}
                  className="flex items-baseline justify-between gap-4 border-b border-border/25 py-3"
                >
                  <span className="text-[13px] text-muted-foreground">
                    {limit.label}
                  </span>
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {limit.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-muted-foreground">
              Exceeded rate limits return HTTP{" "}
              <code className="font-mono text-foreground">
                429 Too Many Requests
              </code>{" "}
              with a{" "}
              <code className="font-mono text-foreground">Retry-After</code>{" "}
              header.
            </p>
          </Section>

          {/* Status Codes */}
          <Section
            id="status-codes"
            index="09"
            title="Status Codes"
            lead="Every response code the API can return."
          >
            <div className="border-y border-border/25">
              {STATUS_CODES.map((status) => (
                <div
                  key={status.code}
                  className="flex flex-col gap-1 border-b border-border/25 py-3 last:border-0 sm:flex-row sm:items-center sm:gap-8"
                >
                  <code className="w-44 shrink-0 font-mono text-xs font-semibold text-foreground">
                    {status.code}
                  </code>
                  <span className="text-[13px] text-muted-foreground">
                    {status.desc}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
