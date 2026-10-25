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
  title: "JSONLive — Turn JSON into a Usable API | jsonlive.revandev.my.id",
  description:
    "Paste your JSON, save it, and get a public API endpoint instantly. No backend setup required.",
  keywords: [
    "JSON",
    "mock API",
    "public API",
    "JSONLive",
    "frontend development",
    "API mock",
    "no backend",
    "web development",
  ],
  openGraph: {
    title: "JSONLive — Turn JSON into a Usable API",
    description:
      "Paste your JSON, save it, and get a public API endpoint instantly. No backend setup required.",
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
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSONLive — Turn JSON into a Usable API",
    description:
      "Paste your JSON, save it, and get a public API endpoint instantly. No backend setup required.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  viewport: "width=device-width,initial-scale=1",
  alternates: {
    canonical: "https://jsonlive.revandev.my.id",
  },
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
        <meta
          name="google-site-verification"
          content="7a7CaksyYk68RZUKIr4pbJpmfZedqChwMMoGifDthhw"
        />
        <link rel="canonical" href="https://jsonlive.revandev.my.id" />
      </head>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Provider>{children}</Provider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://jsonlive.revandev.my.id",
              name: "JSONLive",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://jsonlive.revandev.my.id/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
