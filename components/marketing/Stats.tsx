"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

type Stat = {
  prefix?: string;
  suffix?: string;
  value?: number;
  staticText?: string;
  label: string;
};

const stats: Stat[] = [
  {
    staticText: "< 1s",
    label: "To a live endpoint",
  },
  {
    value: 3,
    label: "Simple steps: paste, save, fetch",
  },
  {
    value: 5,
    suffix: " MB",
    label: "JSON per resource",
  },
  {
    value: 100,
    suffix: "%",
    label: "Free to use",
  },
];

const CountUp = ({ to, start }: { to: number; start: boolean }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let raf = 0;
    const begin = performance.now();
    const duration = 1400;

    const tick = (now: number) => {
      const progress = Math.min((now - begin) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));

      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, to]);

  return <>{value}</>;
};

export const Stats = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section className="border-t border-border/50 bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-14 max-w-2xl sm:mb-16"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            By the numbers
          </p>
          <h2 className="mb-4 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            Fast, free, and built for developers
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            Mock APIs shouldn&apos;t require a whole infrastructure. JSONLive
            keeps the hard parts simple.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:divide-x lg:divide-border/60 lg:gap-y-0"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 px-4 text-center lg:px-6"
            >
              <span className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                {stat.prefix}
                {stat.staticText ?? (
                  <CountUp to={stat.value ?? 0} start={inView} />
                )}
                {stat.suffix}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};