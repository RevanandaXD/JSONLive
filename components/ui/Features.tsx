import {
  HiOutlineBolt,
  HiOutlineGlobeAlt,
  HiOutlineRocketLaunch,
  HiOutlineCheckCircle,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { FiFeather } from "react-icons/fi";
import { IconType } from "react-icons";
import type { ReactNode } from "react";

type Feature = {
  title: string;
  description: string;
  icon: IconType;
  className?: string;
  content?: ReactNode;
};

const features: Feature[] = [
  {
    title: "Instant API",
    description:
      "Paste your JSON and get a working API endpoint in seconds. No server configuration needed.",
    icon: HiOutlineBolt,
    className: "lg:col-span-2",
    content: (
      <div className="mt-4 rounded-lg border border-border/60 bg-background/60 p-3 font-mono text-xs leading-relaxed">
        <span className="text-primary">POST</span>{" "}
        <span className="text-muted-foreground">/api/resources</span>
        {"\n"}
        <span className="text-green-400">201 Created</span>
        {" · "}
        <span className="text-amber-300">/revan/profile</span>
      </div>
    ),
  },
  {
    title: "JSON Validation",
    description: "Built-in validation ensures only valid JSON is saved.",
    icon: HiOutlineCheckCircle,
  },
  {
    title: "Public Endpoint",
    description:
      "Your API is accessible from anywhere — localhost, Vercel, mobile apps, or CI/CD pipelines.",
    icon: HiOutlineGlobeAlt,
  },
  {
    title: "No Backend Required",
    description:
      "Build and test your frontend without waiting for a backend. Mock APIs that just work.",
    icon: HiOutlineRocketLaunch,
  },
  {
    title: "Lightweight",
    description:
      "Designed to run efficiently on minimal hardware. No heavy dependencies required.",
    icon: FiFeather,
  },
  {
    title: "Edit & Update",
    description:
      "Update your JSON anytime. The endpoint always serves the latest version.",
    icon: HiOutlineCog6Tooth,
  },
];

const cardBase =
  "group flex flex-col rounded-xl border border-border/70 bg-card/60 p-6 transition-all duration-300 hover:border-primary/25 hover:bg-card";

export const Features = () => {
  return (
    <section id="features" className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section heading */}
        <div className="mb-14 text-center sm:mb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Features
          </p>
          <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need
          </h2>
          <p className="mx-auto max-w-lg text-sm text-muted-foreground sm:text-base leading-relaxed">
            JSONLive is built for developers who need a quick, reliable way to
            turn JSON data into accessible API endpoints.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`${cardBase} ${feature.className ?? ""}`}
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-2.5 text-primary transition-colors duration-300 group-hover:bg-primary/15 w-fit">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                {feature.content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
