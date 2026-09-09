"use client";

import { motion } from "motion/react";
import type { Variants } from "motion/react";
import {
  HiOutlineBolt,
  HiOutlineGlobeAlt,
  HiOutlineCheckCircle,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { FaBookReader  } from "react-icons/fa";
import { IconType } from "react-icons";

type Feature = {
  title: string;
  description: string;
  icon: IconType;
};

const features: Feature[] = [
  {
    title: "Instant API",
    description:
      "Paste your JSON and get a working API endpoint in seconds. No server configuration needed.",
    icon: HiOutlineBolt,
  },
  {
    title: "JSON Validation",
    description: "Built-in validation ensures only valid JSON is saved.",
    icon: HiOutlineCheckCircle,
  },
  {
    title: "Public Endpoint",
    description:
      "Accessible from anywhere — localhost, Vercel, mobile apps, or CI/CD pipelines.",
    icon: HiOutlineGlobeAlt,
  },
  {
    title: "No Backend Required",
    description:
      "Build and test your frontend without waiting for a backend.",
    icon: HiOutlineCog6Tooth,
  },
  {
    title: "Great For Learning",
    description:
      "Designed to help people learning about rest API",
    icon: FaBookReader,
  },
  {
    title: "Edit & Update",
    description:
      "Update your JSON anytime. The endpoint always serves the latest version.",
    icon: HiOutlineBolt,
  },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const Features = () => {
  return (
    <section id="features" className="py-20 sm:py-24">
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
            Features
          </p>
          <h2 className="mb-4 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            Everything you need
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            JSONLive is built for developers who need a quick, reliable way to
            turn JSON data into accessible API endpoints.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={item}
                className="flex flex-col rounded-xl border border-border/70 bg-card/60 p-6 transition ease-in duration-100 hover:border-primary"
              >
                <div className="mb-4 w-fit rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-heading text-base font-semibold">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
