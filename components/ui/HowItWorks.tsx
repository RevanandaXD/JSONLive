"use client";

import { motion } from "motion/react";
import type { Variants } from "motion/react";

const steps = [
  {
    step: "01",
    title: "Paste your JSON",
    description: "Create a resource and paste your JSON data in the editor.",
  },
  {
    step: "02",
    title: "Hit save",
    description:
      "JSONLive validates and stores your data, then generates a unique URL.",
  },
  {
    step: "03",
    title: "Fetch anywhere",
    description:
      "Use the endpoint from any frontend, mobile app, or CLI — instantly.",
  },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-t border-border/50 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left — green */}
        <div className="flex flex-col justify-center bg-primary px-6 py-16 sm:py-20 lg:px-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-md"
          >
            <span className="inline-block rounded-full bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              How It Works
            </span>
            <h2 className="mt-5 font-heading text-3xl font-medium leading-tight tracking-tight text-background sm:text-4xl lg:text-5xl">
              From JSON to a working API in seconds
            </h2>
            <p className="mt-5 text-base leading-relaxed text-background/80">
              No complex setup. Paste, save, and fetch — your endpoint is ready
              to use immediately.
            </p>
          </motion.div>
        </div>

        {/* Right — dark */}
        <div className="flex flex-col justify-center bg-background px-6 py-16 sm:py-20 lg:px-16 lg:py-24">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="flex flex-col"
          >
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                variants={item}
                className="flex gap-5 border-b border-border/60 py-7 first:pt-0 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-col items-center">
                  <span className="pt-1 font-mono text-sm font-bold text-primary">
                    {s.step} 
                  </span>
                  {i < steps.length - 1 && (
                    <span className="mt-2 h-full w-px bg-border" />
                  )}
                </div>
                <div>
                  <h3 className="mb-1.5 font-heading text-lg font-semibold">
                    {s.title}
                  </h3>
                  <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
