import type { Metadata } from "next";
import { Poppins, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Provider from "./provider";

const Poppinst = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const JakartaSansPlus = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans-plus",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jsonlive.revandev.my.id"),
  title: "JSONLive — Turn JSON into a Usable API",
  description:
    "Paste your JSON and get a live API endpoint instantly. No backend, no install, no setup.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "JSONLive — Turn JSON into a Usable API",
    description:
      "Paste your JSON and get a live API endpoint instantly.",
    url: "https://jsonlive.revandev.my.id",
    siteName: "JSONLive",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JSONLive",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSONLive — Turn JSON into a Usable API",
    description:
      "Paste your JSON and get a live API endpoint instantly.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  verification: { google: "7a7CaksyYk68RZUKIr4pbJpmfZedqChwMMoGifDthhw" },
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JSONLive",
  url: "https://jsonlive.revandev.my.id",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  description:
    "JSONLive turns pasted JSON data into a live, ready-to-use API endpoint without building a backend.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is JSONLive?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JSONLive is a free web tool that turns pasted JSON data into a live, ready-to-use API endpoint without building a backend. It is built for testing, prototyping, and frontend development.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a backend to use JSONLive?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. JSONLive hosts the API for you. You only need to provide your JSON data.",
      },
    },
    {
      "@type": "Question",
      name: "What are the limits of JSONLive?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each resource can be up to 5 MB of JSON, with 500 reads per minute and 100 writes per minute. Public reads are open, while writes require an API key.",
      },
    },
  ],
};

const themeScript = `
  (function () {
    try {
      var stored = localStorage.getItem("jsonlive-theme");
      var root = document.documentElement;
      root.classList.remove("dark");
      root.classList.remove("light");
      root.classList.add(stored === "light" ? "light" : "dark");
    } catch (e) {
      document.documentElement.classList.add("dark");
    }
  })();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${Poppinst.variable} ${JakartaSansPlus.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
