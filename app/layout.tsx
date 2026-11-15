import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://jsonlive.revandev.my.id"),
  title: {
    default: "JSONLive — Free Mock JSON API & Instant REST API Generator",
    template: "%s | JSONLive",
  },
  description:
    "Transform raw JSON into instant, live REST API endpoints with zero backend setup. Free mock JSON server with CORS, CRUD operations, and rate limiting for frontend testing.",
  keywords: [
    "mock api",
    "mock json api",
    "fake rest api",
    "json to api",
    "online json server",
    "instant api generator",
    "mock backend",
    "frontend prototyping api",
    "cors enabled mock api",
    "json placeholder alternative",
    "free rest api tester",
    "developer tools",
  ],
  authors: [{ name: "Revan", url: "https://revandev.my.id" }],
  creator: "Revan",
  publisher: "JSONLive",
  applicationName: "JSONLive",
  category: "Developer Tools",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "JSONLive — Free Mock JSON API & Instant REST API Generator",
    description:
      "Transform raw JSON into instant, live REST API endpoints with zero backend setup. Free mock JSON server with CORS, CRUD operations, and rate limiting for frontend testing.",
    url: "https://jsonlive.revandev.my.id",
    siteName: "JSONLive",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JSONLive — Free Mock JSON API & Instant REST API Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSONLive — Free Mock JSON API & Instant REST API Generator",
    description:
      "Transform raw JSON into instant, live REST API endpoints with zero backend setup. Free mock JSON server with CORS, CRUD operations, and rate limiting for frontend testing.",
    images: ["/og-image.png"],
    creator: "@revananda2006",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "7a7CaksyYk68RZUKIr4pbJpmfZedqChwMMoGifDthhw",
  },
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "JSONLive",
  url: "https://jsonlive.revandev.my.id",
  description:
    "Free developer tool to turn raw JSON into live public and protected REST API endpoints instantly.",
  inLanguage: "en-US",
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JSONLive",
  url: "https://jsonlive.revandev.my.id",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  description:
    "JSONLive turns pasted JSON data into a live, ready-to-use API endpoint without building a backend. Built for frontend testing, rapid prototyping, and API mock servers.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Instant REST API generation from raw JSON",
    "Full CORS enabled for frontend fetch from localhost and production",
    "Complete CRUD support (GET, POST, PUT, PATCH, DELETE)",
    "Public endpoints and API-key protected private resources",
    "Automatic rate limiting and up to 5MB payload capacity",
  ],
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
        text: "JSONLive turns your JSON data into a live API endpoint instantly. Paste your JSON, save it, and get a URL you can use with fetch() or any HTTP client — public or protected with an API key.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to create a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. JSONLive handles the API hosting for you. You only need to provide your JSON data.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use the API from my frontend?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Your endpoint can be requested from web applications, mobile apps, or any client that can make HTTP requests.",
      },
    },
    {
      "@type": "Question",
      name: "Is my JSON data public?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You choose. Resources are public by default, so anyone with the endpoint URL can read them. You can also mark a resource as private — requests then need one of your API keys, sent as an x-api-key header (or Authorization: Bearer), to return the data.",
      },
    },
    {
      "@type": "Question",
      name: "How big can my JSON be?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each resource can be up to 5 MB of JSON. The limit keeps the service fast and reliable for everyone.",
      },
    },
    {
      "@type": "Question",
      name: "Do you have rate limits?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All endpoints are rate-limited to prevent abuse and keep the service available for everyone.",
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
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
