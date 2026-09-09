const steps = [
  {
    step: "01",
    title: "Create Resource",
    description: "Give your resource a name and paste your JSON data.",
  },
  {
    step: "02",
    title: "Save",
    description:
      "JSONLive validates and stores your data. A unique URL is generated.",
  },
  {
    step: "03",
    title: "Fetch",
    description:
      "Use the endpoint from any application — frontend, mobile, or CLI.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="border-t border-border/50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section heading */}
        <div className="mb-14 text-center sm:mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Three simple steps
          </h2>
          <p className="mx-auto max-w-lg text-sm text-muted-foreground sm:text-base leading-relaxed">
            From JSON to a working API in seconds.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.step} className="relative text-center">
              {/* Connecting line (desktop only) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-gradient-to-r from-primary/25 to-border/30" />
              )}

              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-primary/10 font-mono text-sm font-bold text-primary">
                {s.step}
              </div>
              <h3 className="mb-2 font-heading text-base font-semibold sm:text-lg">
                {s.title}
              </h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </div>
          ))}
        </div>

        {/* Code Example */}
        <div className="mt-14 sm:mt-16 mx-auto max-w-2xl overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
          {/* Browser bar */}
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 bg-card/80">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-xs text-muted-foreground/60 font-mono">
              fetch example
            </span>
          </div>

          <pre className="overflow-x-auto p-5 sm:p-6 text-left text-xs sm:text-sm leading-relaxed font-mono">
            <code>
              <span className="text-purple-400">{"const "}</span>
              <span className="text-foreground">{"response"}</span>
              <span className="text-muted-foreground">{" = "}</span>
              <span className="text-purple-400">{"await "}</span>
              <span className="text-blue-400">{"fetch"}</span>
              <span className="text-muted-foreground">{"("}</span>
              <span className="text-amber-300">
                {'"https://jsonlive.example/revan/profile"'}
              </span>
              <span className="text-muted-foreground">{")"}</span>
              <span className="text-muted-foreground">{";"}</span>
              {"\n\n"}
              <span className="text-purple-400">{"const "}</span>
              <span className="text-foreground">{"data"}</span>
              <span className="text-muted-foreground">{" = "}</span>
              <span className="text-purple-400">{"await "}</span>
              <span className="text-foreground">{"response"}</span>
              <span className="text-muted-foreground">{"."}</span>
              <span className="text-blue-400">{"json"}</span>
              <span className="text-muted-foreground">{"();"}</span>
              {"\n\n"}
              <span className="text-muted-foreground/60">
                {"// { name: 'Revan', role: 'Developer' }"}
              </span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
};
