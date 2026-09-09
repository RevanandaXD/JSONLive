"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { FiChevronDown } from "react-icons/fi";

type FAQItem = {
  question: string;
  answer: string;
};

const frequencyAsk: FAQItem[] = [
  {
    question: "What is JSONLive?",
    answer:
      "JSONLive turns your JSON data into a public API endpoint instantly. Paste your JSON, save it, and get a URL you can use with fetch() or any HTTP client.",
  },
  {
    question: "Do I need to create a server?",
    answer:
      "No. JSONLive handles the API hosting for you. You only need to provide your JSON data.",
  },
  {
    question: "Can I use the API from my frontend?",
    answer:
      "Yes. Your endpoint can be requested from web applications, mobile apps, or any client that can make HTTP requests.",
  },
  {
    question: "Is my JSON data public?",
    answer:
      "Public endpoints are accessible by anyone who knows the URL. Don't store passwords, API keys, tokens, or other sensitive information in your JSON.",
  },
  {
    question: "How big can my JSON be?",
    answer:
      "For the MVP, JSONLive limits the size of each resource to keep the service fast and reliable — up to 1 MB per resource.",
  },
  {
    question: "Do you have rate limits?",
    answer:
      "Yes. Public endpoints are rate-limited to prevent abuse and keep the service available for everyone.",
  },
];

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) =>
    setOpenIndex((current) => (current === index ? null : index));

  return (
    <section className="border-t border-border/50 py-20 sm:py-24">
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
            Frequently Asked Questions
          </p>
          <h2 className="mb-4 font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            Search the answer below
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            Common questions about using JSONLive for your projects.
          </p>
        </motion.div>

        {/* FAQ list */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="flex flex-col gap-3.5"
        >
          {frequencyAsk.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.question}
                variants={item}
                className="rounded-xl border border-border/70 bg-card/60 px-5"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left font-heading text-sm font-semibold text-foreground"
                >
                  {faq.question}
                  <FiChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <motion.div
                  initial={false}
                  animate={
                    isOpen
                      ? { height: "auto", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
