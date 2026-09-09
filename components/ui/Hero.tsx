"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { FiArrowRight, FiZap } from "react-icons/fi";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const Hero = () => {
  return (
    <section className="bg-primary" id="hero-section">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-7xl flex-col px-6 py-20 sm:py-28"
      >
        <motion.div variants={item} className="max-w-3xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-xs md:text-md font-semibold text-primary shadow-sm">
            <FiZap className="h-4 w-4" />
            The simplest way to turn JSON into a usable API
          </span>

          {/* Heading */}
          <h1 className="mt-8 font-heading text-4xl font-medium leading-tight tracking-tight text-background sm:text-5xl lg:text-6xl">
            Turn JSON into a usable API
          </h1>

          {/* Subtext */}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-background/80">
            Paste your JSON, save it, and get a public API endpoint instantly.
            No backend setup required. Perfect for frontend development,
            prototyping, and testing.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-7 py-3.5 text-sm font-bold text-primary"
            >
              Get Started
              <FiArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-background/40 px-7 py-3.5 text-sm font-semibold text-background hover:bg-background/10"
            >
              See How It Works
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
