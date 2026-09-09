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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${Poppinst.variable} ${JakartaSansPlus.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
