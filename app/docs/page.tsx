import type { Metadata } from "next";
import Link from "next/link";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { MethodBadge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { Tabs } from "@/components/ui/Tabs";
import { LIMITS, MAX_API_KEYS, RATE_LIMIT } from "@/src/lib/config";
import {
  BEHAVIOR_NOTES,
  COLLECTION_ENDPOINTS,
  CONSUME_EXAMPLE,
  EXAMPLES,
  HOST,
  ITEM_ENDPOINTS,
  SAMPLE_DATA,
  STATUS_CODES,
  type Endpoint,
} from "@/src/lib/docs";
import DocsSidebar from "@/components/layout/DocsSidebar";

export const metadata: Metadata = {
  title: "API Reference | JSONLive",
  description:
    "REST API reference for JSONLive resources — read, create, replace, update, and delete JSON over plain HTTP.",
};

const SIDEBAR_LINKS = [
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

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-border/40 pt-8 first:border-0 first:pt-0"
    >
      <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CodeBlock({ code, muted = false }: { code: string; muted?: boolean }) {
  return (
    <pre
      className={`overflow-x-auto p-3.5 font-mono text-xs leading-relaxed sm:text-[13px] ${
        muted ? "text-muted-foreground" : "text-foreground"
      }`}
    >
      <code>{code}</code>
    </pre>
  );
}

function CodePanel({ code }: { code: string }) {
  return (
    <div className="relative">
      <div className="flex justify-end border-b border-border/40 bg-muted/20 px-3 py-1.5">
        <CopyButton
          value={code}
          ariaLabel="Copy code"
          className="h-6 px-2 text-[11px]"
        />
      </div>
      <CodeBlock code={code} />
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-card/40">
      {children}
    </div>
  );
}

function EndpointList({ items }: { items: Endpoint[] }) {
  return (
    <Panel>
      {items.map((endpoint, i) => (
        <div
          key={`${endpoint.method}-${endpoint.path}`}
          className={`flex flex-col gap-2 p-4 transition-colors hover:bg-muted/10 sm:flex-row sm:items-start sm:gap-4 ${
            i === items.length - 1 ? "" : "border-b border-border/50"
          }`}
        >
          <div className="shrink-0 pt-0.5">
            <MethodBadge method={endpoint.method} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <code className="font-mono text-xs font-semibold text-foreground sm:text-sm">
                {endpoint.path}
              </code>
              <span className="font-mono text-[11px] text-muted-foreground/60">
                {endpoint.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {endpoint.desc}
            </p>
          </div>
        </div>
      ))}
    </Panel>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNav />

      <div className="mx-auto flex max-w-6xl items-start gap-10 px-4 py-8 sm:px-6">
        <aside className="sticky top-20 hidden w-52 shrink-0 py-2 md:block">
          <DocsSidebar props={SIDEBAR_LINKS}/>
        </aside>

        <main className="min-w-0 flex-1 space-y-10">
          <header id="overview" className="scroll-mt-24">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              API Reference
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every published resource generates an instant HTTP endpoint. Read
              operations require no authentication and have open CORS, while
              write mutations are secured with your API key.
            </p>

            <div className="mt-6 rounded-lg border border-border/70 bg-card/40 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Base URL
              </span>
              <div className="mt-2 flex items-center justify-between rounded border border-border/60 bg-background/50 px-3 py-2 font-mono text-xs sm:text-sm">
                <span>{HOST}/api</span>
                <CopyButton
                  value={`${HOST}/api`}
                  className="h-6 px-2 text-xs"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                All routes accept and return JSON (
                <code className="font-mono text-foreground">
                  application/json
                </code>
                ).
              </p>
            </div>
          </header>

          {/* Authentication */}
          <Section id="authentication" title="Authentication">
            <Panel>
              <div className="divide-y divide-border/50 p-4 text-xs text-muted-foreground sm:text-sm">
                <div className="pb-3">
                  <p className="font-semibold text-foreground">Read (GET)</p>
                  <p className="mt-1">
                    No authentication or headers needed. Browsers can query
                    endpoints directly from any origin.
                  </p>
                </div>
                <div className="pt-3">
                  <p className="font-semibold text-foreground">
                    Write (POST, PUT, PATCH, DELETE)
                  </p>
                  <p className="mt-1">
                    Requires an API key sent in the header:
                  </p>
                  <code className="mt-2 block w-fit rounded border border-border/60 bg-background/60 px-2.5 py-1 font-mono text-xs text-foreground">
                    x-api-key: jlv_...
                  </code>
                  <p className="mt-2 text-xs">
                    You can manage your keys in{" "}
                    <Link
                      href="/settings"
                      className="text-primary hover:underline"
                    >
                      Account Settings
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </Panel>
          </Section>

          {/* Quickstart */}
          <Section id="quickstart" title="Quickstart">
            <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
              Use standard{" "}
              <code className="font-mono text-foreground">fetch</code> in any
              browser or JavaScript runtime:
            </p>
            <Panel>
              <CodePanel code={CONSUME_EXAMPLE} />
            </Panel>
          </Section>

          {/* Collection Routes */}
          <Section id="collection-routes" title="Collection Routes">
            <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
              Endpoints that operate on the whole resource dataset:
            </p>
            <EndpointList items={COLLECTION_ENDPOINTS} />
          </Section>

          {/* Item Routes */}
          <Section id="item-routes" title="Item Routes">
            <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
              Endpoints targeting a specific item in an array resource by its{" "}
              <code className="font-mono text-foreground">id</code>:
            </p>
            <EndpointList items={ITEM_ENDPOINTS} />
          </Section>

          {/* Sample Data */}
          <Section id="starter-data" title="Sample Dataset">
            <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
              The CRUD examples below use a resource named{" "}
              <code className="font-mono text-foreground">users</code> owned by{" "}
              <code className="font-mono text-foreground">revan</code>:
            </p>
            <Panel>
              <CodePanel code={SAMPLE_DATA} />
            </Panel>
          </Section>

          {/* CRUD Tutorial */}
          <Section id="examples" title="CRUD Operations">
            <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
              Follow these operations sequentially to explore how data updates
              over HTTP:
            </p>

            <div className="space-y-4">
              {EXAMPLES.map((example) => (
                <article
                  key={example.step}
                  className="overflow-hidden rounded-lg border border-border/70 bg-card/40"
                >
                  <div className="border-b border-border/50 p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 font-mono text-xs font-semibold text-primary">
                        {example.step}
                      </span>
                      <h3 className="text-sm font-semibold text-foreground">
                        {example.title}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {example.summary}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <MethodBadge method={example.method} />
                      <code className="min-w-0 font-mono text-xs text-foreground">
                        {example.path}
                      </code>
                    </div>

                    {example.note && (
                      <p className="mt-2 text-xs text-primary">
                        {example.note}
                      </p>
                    )}
                  </div>

                  <Tabs
                    items={[
                      {
                        value: "curl",
                        label: "cURL",
                        content: <CodePanel code={example.curl} />,
                      },
                      {
                        value: "js",
                        label: "JavaScript",
                        content: <CodePanel code={example.js} />,
                      },
                    ]}
                  />

                  <div className="border-t border-border/50 bg-muted/10 p-3">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Response</span>
                      <span className="font-mono font-medium text-foreground">
                        {example.status}
                      </span>
                    </div>
                    <div className="mt-1 overflow-hidden rounded border border-border/50 bg-background/50">
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
          <Section id="notes" title="Behavior Notes">
            <Panel>
              <ul className="divide-y divide-border/50 text-xs text-muted-foreground sm:text-sm">
                {BEHAVIOR_NOTES.map((note, idx) => (
                  <li key={idx} className="p-3.5 leading-relaxed">
                    {note}
                  </li>
                ))}
              </ul>
            </Panel>
          </Section>

          {/* Limits */}
          <Section id="limits" title="Limits & Quotas">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LIMITS_LIST.map((limit) => (
                <div
                  key={limit.label}
                  className="rounded-lg border border-border/70 bg-card/40 p-4"
                >
                  <p className="text-xs text-muted-foreground">{limit.label}</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                    {limit.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
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
          <Section id="status-codes" title="Status Codes">
            <Panel>
              {STATUS_CODES.map((status, i) => (
                <div
                  key={status.code}
                  className={`flex flex-col gap-1 p-3.5 sm:flex-row sm:items-center sm:gap-6 ${
                    i === STATUS_CODES.length - 1
                      ? ""
                      : "border-b border-border/50"
                  }`}
                >
                  <code className="w-40 shrink-0 font-mono text-xs font-semibold text-foreground">
                    {status.code}
                  </code>
                  <span className="text-xs text-muted-foreground sm:text-sm">
                    {status.desc}
                  </span>
                </div>
              ))}
            </Panel>
          </Section>
        </main>
      </div>
    </div>
  );
}
