import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardNav } from "@/components/ui/DashboardNav";
import { LIMITS, MAX_API_KEYS, RATE_LIMIT } from "@/src/lib/config";

export const metadata: Metadata = {
  title: "API Docs | JSONLive",
  description:
    "REST API reference for JSONLive resources — read, create, replace, update, and delete JSON over plain HTTP.",
};

const HOST = "https://jsonlive.example";

const methodTone: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400",
  POST: "bg-sky-500/15 text-sky-400",
  PUT: "bg-amber-500/15 text-amber-400",
  PATCH: "bg-violet-500/15 text-violet-400",
  DELETE: "bg-red-500/15 text-red-400",
  OPTIONS: "bg-muted text-muted-foreground",
};

type Endpoint = {
  method: string;
  path: string;
  desc: string;
  status: string;
};

const collectionEndpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/api/:username/:resource",
    desc: "Read the resource. Objects are returned as-is, arrays return every item.",
    status: "200 / 401 / 404",
  },
  {
    method: "POST",
    path: "/api/:username/:resource",
    desc: "Append an item to an array resource. Generates an id when the body omits one.",
    status: "201 / 400 / 401",
  },
  {
    method: "PUT",
    path: "/api/:username/:resource",
    desc: "Replace the whole collection with the array sent in the body.",
    status: "200 / 400 / 401",
  },
  {
    method: "OPTIONS",
    path: "/api/:username/:resource",
    desc: "CORS preflight for browser clients.",
    status: "204",
  },
];

const itemEndpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/api/:username/:resource/:id",
    desc: "Read one item by its id field.",
    status: "200 / 400 / 404",
  },
  {
    method: "PUT",
    path: "/api/:username/:resource/:id",
    desc: "Replace one item. Fields absent from the body are removed.",
    status: "200 / 400 / 404",
  },
  {
    method: "PATCH",
    path: "/api/:username/:resource/:id",
    desc: "Merge fields into one item. Only the sent keys change.",
    status: "200 / 400 / 404",
  },
  {
    method: "DELETE",
    path: "/api/:username/:resource/:id",
    desc: "Remove one item from the collection.",
    status: "200 / 400 / 404",
  },
  {
    method: "OPTIONS",
    path: "/api/:username/:resource/:id",
    desc: "CORS preflight for browser clients.",
    status: "204",
  },
];

const readExample = `// Read the whole collection — no authentication required
const res = await fetch("${HOST}/api/revan/users");
const users = await res.json();

// Read a single item
const one = await fetch("${HOST}/api/revan/users/1").then((r) => r.json());`;

const createExample = `// Create an item. "id" is generated when it is not sent.
const res = await fetch("${HOST}/api/revan/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "jlv_...",
  },
  body: JSON.stringify({ name: "Budi", role: "Designer" }),
});

const created = await res.json(); // 201, includes the generated id`;

const patchExample = `// Merge fields into an item (PATCH keeps the other fields intact)
await fetch("${HOST}/api/revan/users/1", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "jlv_...",
  },
  body: JSON.stringify({ role: "Senior Developer" }),
});

// Replace an item (PUT drops every field that is not sent)
await fetch("${HOST}/api/revan/users/1", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "jlv_...",
  },
  body: JSON.stringify({ name: "Revan", role: "Developer" }),
});`;

const replaceExample = `// Replace the whole collection in one call
await fetch("${HOST}/api/revan/users", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "jlv_...",
  },
  body: JSON.stringify([
    { id: 1, name: "Revan" },
    { id: 2, name: "Budi" },
  ]),
});`;

const deleteExample = `// Delete one item
const res = await fetch("${HOST}/api/revan/users/1", {
  method: "DELETE",
  headers: { "x-api-key": "jlv_..." },
});

const result = await res.json(); // { "success": true }`;

const notes = [
  "Only published resources are reachable. Unpublished ones answer with 404.",
  "A private resource only serves GET to its owner session. Public data needs no login at all.",
  "Item routes (:id) require an array resource whose entries carry an id field.",
  "POST and PUT on a collection require an array body; POST and PUT on an item require an object body.",
  "POST generates the next numeric id, or a UUID when the collection has no numeric ids.",
  "Every public response ships Access-Control-Allow-Origin: * so browsers can call it from any origin.",
];

const statuses = [
  { code: "200 OK", desc: "Request succeeded." },
  { code: "201 Created", desc: "POST created a new item." },
  { code: "204 No Content", desc: "OPTIONS preflight succeeded." },
  { code: "400 Bad Request", desc: "Malformed JSON, or a body shape the route does not accept." },
  { code: "401 Unauthorized", desc: "Write request without a valid API key, or GET on a private resource." },
  { code: "404 Not Found", desc: "Unknown username, resource, or item id." },
  { code: "429 Too Many Requests", desc: "Rate limit reached. See the Retry-After header." },
];

const limits = [
  { label: "Read requests", value: `${RATE_LIMIT.GET.limit} / minute` },
  { label: "Write requests", value: `${RATE_LIMIT.WRITE.limit} / minute` },
  { label: "JSON per resource", value: `${(LIMITS.MAX_JSON_SIZE / (1024 * 1024)).toFixed(0)} MB` },
  { label: "Resources per user", value: `${LIMITS.MAX_RESOURCES}` },
  { label: "API keys per user", value: `${MAX_API_KEYS}` },
];

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`shrink-0 rounded-md px-2 py-1 font-mono text-xs font-bold ${methodTone[method]}`}
    >
      {method}
    </span>
  );
}

function EndpointList({ items }: { items: Endpoint[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
      {items.map((e, i) => (
        <div
          key={`${e.method}-${e.path}`}
          className={`px-5 py-4 ${i === items.length - 1 ? "" : "border-b border-border/60"}`}
        >
          <div className="flex items-start gap-3">
            <MethodBadge method={e.method} />
            <code className="min-w-0 flex-1 break-all font-mono text-sm text-foreground">
              {e.path}
            </code>
            <span className="shrink-0 font-mono text-xs text-muted-foreground/60">
              {e.status}
            </span>
          </div>
          <p className="mt-2 pl-0.5 text-sm text-muted-foreground sm:pl-[3.75rem]">
            {e.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

function ExampleBlock({
  title,
  language,
  code,
}: {
  title: string;
  language: string;
  code: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
        <span className="text-sm font-semibold">{title}</span>
        <span className="font-mono text-xs text-muted-foreground/60">
          {language}
        </span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed sm:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

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

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-10">
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
        </div>

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
            <EndpointList items={collectionEndpoints} />
          </Section>

          <Section id="items" title="Item routes">
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Item routes act on a single entry inside an array resource,
              addressed by the entry&apos;s <code className="font-mono text-primary">id</code>{" "}
              field.
            </p>
            <EndpointList items={itemEndpoints} />
          </Section>

          <Section id="examples" title="Examples">
            <div className="space-y-4">
              <ExampleBlock title="Read" language="javascript" code={readExample} />
              <ExampleBlock
                title="Create"
                language="javascript"
                code={createExample}
              />
              <ExampleBlock
                title="Update"
                language="javascript"
                code={patchExample}
              />
              <ExampleBlock
                title="Replace a collection"
                language="javascript"
                code={replaceExample}
              />
              <ExampleBlock
                title="Delete"
                language="javascript"
                code={deleteExample}
              />
            </div>
          </Section>

          <Section id="notes" title="Behavior notes">
            <ul className="space-y-2.5">
              {notes.map((note) => (
                <li key={note} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {note}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="limits" title="Limits">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {limits.map((l) => (
                <div
                  key={l.label}
                  className="rounded-xl border border-border/70 bg-card/60 p-5"
                >
                  <p className="text-xs text-muted-foreground">{l.label}</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                    {l.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Rate limits are enforced per IP address on a rolling window. When a
              limit is hit the API answers{" "}
              <code className="font-mono text-primary">429</code> and includes a{" "}
              <code className="font-mono text-primary">Retry-After</code> header
              with the number of seconds to wait.
            </p>
          </Section>

          <Section id="status-codes" title="Status codes">
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
              {statuses.map((s, i) => (
                <div
                  key={s.code}
                  className={`flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-6 ${
                    i === statuses.length - 1 ? "" : "border-b border-border/60"
                  }`}
                >
                  <code className="w-44 shrink-0 font-mono text-xs font-semibold text-foreground">
                    {s.code}
                  </code>
                  <span className="text-sm text-muted-foreground">{s.desc}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}
