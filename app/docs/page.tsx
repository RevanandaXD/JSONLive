import type { Metadata } from "next";
import type { ReactNode } from "react";
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

export const metadata: Metadata = {
  title: "API Docs | JSONLive",
  description:
    "REST API reference for JSONLive resources — read, create, replace, update, and delete JSON over plain HTTP.",
};

const LIMITS_LIST = [
  { label: "Read requests", value: `${RATE_LIMIT.GET.limit} / minute` },
  { label: "Write requests", value: `${RATE_LIMIT.WRITE.limit} / minute` },
  { label: "JSON per resource", value: `${(LIMITS.MAX_JSON_SIZE / (1024 * 1024)).toFixed(0)} MB` },
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
    <section id={id} className="scroll-mt-24">
      <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CodeBlock({ code, muted = false }: { code: string; muted?: boolean }) {
  return (
    <pre
      className={`overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:text-[13px] ${
        muted ? "text-muted-foreground" : "text-foreground"
      }`}
    >
      <code>{code}</code>
    </pre>
  );
}

function CodePanel({ code }: { code: string }) {
  return (
    <>
      <div className="flex justify-end border-b border-border/60 px-3 py-2">
        <CopyButton
          value={code}
          ariaLabel="Copy code"
          className="px-2 py-1.5"
        />
      </div>
      <CodeBlock code={code} />
    </>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
      {children}
    </div>
  );
}

function PanelHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3">
      <span className="text-sm font-semibold text-foreground">{title}</span>
      {action}
    </div>
  );
}

function EndpointList({ items }: { items: Endpoint[] }) {
  return (
    <Panel>
      {items.map((endpoint, i) => (
        <div
          key={`${endpoint.method}-${endpoint.path}`}
          className={`px-5 py-4 ${
            i === items.length - 1 ? "" : "border-b border-border/60"
          }`}
        >
          <div className="flex items-start gap-3">
            <MethodBadge method={endpoint.method} />
            <code className="min-w-0 flex-1 break-all font-mono text-sm text-foreground">
              {endpoint.path}
            </code>
            <span className="shrink-0 font-mono text-xs text-muted-foreground/60">
              {endpoint.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:pl-[3.75rem]">
            {endpoint.desc}
          </p>
        </div>
      ))}
    </Panel>
  );
}

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            API Docs
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Public REST API
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every resource you publish becomes a live JSON endpoint. Reads are
            open to the world, and writes are available to you through an API
            key — so the same URL can be both a read-only mock and a working
            CRUD backend for testing.
          </p>
        </header>

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-card/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Base URL
            </p>
            <code className="mt-2 block break-all font-mono text-sm text-foreground">
              {HOST}/api
            </code>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              All routes below are appended to this prefix. Send and receive{" "}
              <code className="font-mono text-primary">application/json</code>.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Authentication
            </p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Read</span> — no
                authentication. CORS is open to every origin.
              </li>
              <li>
                <span className="font-semibold text-foreground">Write</span> —
                requires an API key from Settings, sent as{" "}
                <code className="font-mono text-primary">x-api-key</code> or{" "}
                <code className="font-mono text-primary">
                  Authorization: Bearer &lt;key&gt;
                </code>
                .
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-10">
          <Section id="collection" title="Collection routes">
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Collection routes act on the whole resource: read everything,
              append an item, or overwrite the entire dataset.
            </p>
            <EndpointList items={COLLECTION_ENDPOINTS} />
          </Section>

          <Section id="items" title="Item routes">
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Item routes act on a single entry inside an array resource,
              addressed by the entry&apos;s{" "}
              <code className="font-mono text-primary">id</code> field.
            </p>
            <EndpointList items={ITEM_ENDPOINTS} />
          </Section>

          <Section id="examples" title="Examples">
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Follow the steps in order — each one builds on the data left by
              the previous one. Steps 1 and 2 need no key, the rest need an API
              key from Settings.
            </p>

            <div className="space-y-4">
              {/* Sample data every example refers to */}
              <Panel>
                <PanelHeader title="The resource used below" />
                <div className="px-5 py-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Every example acts on one resource:{" "}
                    <code className="font-mono text-foreground">users</code>,
                    owned by user{" "}
                    <code className="font-mono text-foreground">revan</code>,
                    holding these two entries.
                  </p>
                </div>
                <CodeBlock code={SAMPLE_DATA} />
                <p className="border-t border-border/60 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground">
                  Copy the JSON above into a new resource named{" "}
                  <code className="font-mono text-primary">users</code> and
                  publish it — then every request on this page works as written.
                </p>
              </Panel>

              <div className="grid items-start gap-4 md:grid-cols-2">
                {EXAMPLES.map((example) => (
                  <article
                    key={example.step}
                    className="overflow-hidden rounded-xl border border-border/70 bg-card/60"
                  >
                    <div className="border-b border-border/60 px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          {example.step}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-foreground">
                            {example.title}
                          </h3>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {example.summary}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 pl-9">
                        <MethodBadge method={example.method} />
                        <code className="min-w-0 flex-1 break-all font-mono text-xs text-foreground sm:text-sm">
                          {example.path}
                        </code>
                      </div>

                      {example.note && (
                        <p className="mt-2.5 pl-9 text-xs leading-relaxed text-primary">
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

                    <div className="border-t border-border/60 bg-muted/20">
                      <div className="flex items-center gap-2 px-4 py-2">
                        <span className="font-mono text-xs font-semibold text-foreground">
                          {example.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Response
                        </span>
                      </div>
                      <CodeBlock code={example.response} muted />
                    </div>

                    {example.result && (
                      <p className="border-t border-border/60 px-4 py-2.5 text-xs leading-relaxed text-muted-foreground">
                        {example.result}
                      </p>
                    )}
                  </article>
                ))}
              </div>

              <Panel>
                <PanelHeader title="Use it in your app" />
                <div className="px-5 py-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    The endpoint is a normal URL, so any HTTP client works —
                    fetch, axios, Postman, or curl. No SDK, no CORS setup.
                  </p>
                </div>
                <CodeBlock code={CONSUME_EXAMPLE} />
              </Panel>
            </div>
          </Section>

          <Section id="notes" title="Behavior notes">
            <ul className="space-y-2.5">
              {BEHAVIOR_NOTES.map((note) => (
                <li
                  key={note}
                  className="flex gap-3 text-sm text-muted-foreground"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {note}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="limits" title="Limits">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {LIMITS_LIST.map((limit) => (
                <div
                  key={limit.label}
                  className="rounded-xl border border-border/70 bg-card/60 p-5"
                >
                  <p className="text-xs text-muted-foreground">
                    {limit.label}
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                    {limit.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Rate limits are enforced per IP address on a rolling window. When
              a limit is hit the API answers{" "}
              <code className="font-mono text-primary">429</code> and includes a{" "}
              <code className="font-mono text-primary">Retry-After</code> header
              with the number of seconds to wait.
            </p>
          </Section>

          <Section id="status-codes" title="Status codes">
            <Panel>
              {STATUS_CODES.map((status, i) => (
                <div
                  key={status.code}
                  className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-6 ${
                    i === STATUS_CODES.length - 1
                      ? ""
                      : "border-b border-border/60"
                  }`}
                >
                  <code className="w-44 shrink-0 font-mono text-xs font-semibold text-foreground">
                    {status.code}
                  </code>
                  <span className="text-sm text-muted-foreground">
                    {status.desc}
                  </span>
                </div>
              ))}
            </Panel>
          </Section>
        </div>
      </main>
    </div>
  );
}
