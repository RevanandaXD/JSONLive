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
  title: "JSONLive — Turn JSON into a Usable API",
  description:
    "Paste your JSON, save it, and get a public API endpoint instantly. No backend setup required.",
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
        <meta name="google-site-verification" content="7a7CaksyYk68RZUKIr4pbJpmfZedqChwMMoGifDthhw" />
      </head>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
