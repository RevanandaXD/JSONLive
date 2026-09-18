import { DashboardNav } from "@/components/ui/DashboardNav";

const endpoints = [
  {
    method: "GET",
    path: "/api/:username/:resource",
    desc: "Ambil seluruh data dari sebuah resource.",
    status: "200 / 404",
  },
];

const example = `// Ambil data resource secara publik
const response = await fetch(
  "https://jsonlive.example/api/revan/users"
);

const users = await response.json();`;

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <DashboardNav />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            API Docs
          </p>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Public API
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Endpoint ini selalu standby dan bisa di-<code className="font-mono text-primary">fetch</code>{" "}
            dari mana saja tanpa perlu menjalankan server.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
          {endpoints.map((e) => (
            <div
              key={e.path}
              className="flex items-center gap-3 border-b border-border/60 px-5 py-4 last:border-b-0"
            >
              <span className="rounded-md bg-primary/15 px-2 py-1 font-mono text-xs font-bold text-primary">
                {e.method}
              </span>
              <code className="min-w-0 flex-1 truncate font-mono text-sm text-muted-foreground">
                {e.path}
              </code>
              <span className="shrink-0 text-xs text-muted-foreground/60">
                {e.status}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-border/70 bg-card/60">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
            <span className="text-sm font-semibold">Contoh</span>
            <span className="font-mono text-xs text-muted-foreground/60">
              javascript
            </span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed sm:text-sm">
            <code>{example}</code>
          </pre>
        </div>
      </main>
    </div>
  );
}
