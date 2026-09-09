import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_50%)] opacity-[0.07]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(34,197,94,0.08)_0%,_transparent_70%)] blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-24 text-center">

        {/* Heading */}
        <h1 className="mb-6 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
          Turn JSON into a
          <br className="hidden sm:block" />
          <span className="text-primary"> usable API</span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mb-10 max-w-xl text-base text-muted-foreground leading-relaxed sm:text-lg">
          Paste your JSON, save it, and get a public API endpoint instantly.
          No backend setup required. Perfect for frontend development,
          prototyping, and testing.
        </p>

        {/* CTAs */}
        <div className="mb-16 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-background transition-all duration-200 active:translate-y-0"
          >
            Get Started
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto rounded-xl border border-border px-8 py-3.5 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:border-muted-foreground hover:text-foreground"
          >
            See How It Works
          </a>
        </div>

        {/* Code Preview */}
        <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          {/* Browser bar */}
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3 bg-card/80">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-xs text-muted-foreground/60 font-mono">
              jsonlive.example
            </span>
          </div>

          {/* Code block */}
          <pre className="overflow-x-auto p-5 sm:p-6 text-left text-xs sm:text-sm leading-relaxed font-mono">
            <code>
              <span className="text-muted-foreground/60">{"// Your JSON"}</span>
              {"\n"}
              <span className="text-foreground">{"{"}</span>
              {"\n"}
              {"  "}
              <span className="text-blue-400">{'"name"'}</span>
              <span className="text-muted-foreground">{": "}</span>
              <span className="text-amber-300">{'"Revan"'}</span>
              <span className="text-muted-foreground">{","}</span>
              {"\n"}
              {"  "}
              <span className="text-blue-400">{'"role"'}</span>
              <span className="text-muted-foreground">{": "}</span>
              <span className="text-amber-300">{'"Developer"'}</span>
              <span className="text-muted-foreground">{","}</span>
              {"\n"}
              {"  "}
              <span className="text-blue-400">{'"skills"'}</span>
              <span className="text-muted-foreground">{": ["}</span>
              <span className="text-amber-300">{'"React"'}</span>
              <span className="text-muted-foreground">{", "}</span>
              <span className="text-amber-300">{'"Next.js"'}</span>
              <span className="text-muted-foreground">{"]"}</span>
              {"\n"}
              <span className="text-foreground">{"}"}</span>
              {"\n\n"}
              <span className="text-muted-foreground/60">
                {"// Your API endpoint"}
              </span>
              {"\n"}
              <span className="text-primary font-semibold">{"GET "}</span>
              <span className="text-muted-foreground">{"/api/"}</span>
              <span className="text-foreground">{"revan"}</span>
              <span className="text-muted-foreground">{"/profile"}</span>
              {"\n"}
              <span className="text-primary">{"→ 200 OK"}</span>
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
};
