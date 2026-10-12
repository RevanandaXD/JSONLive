import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Policy & Acceptable Use | JSONLive",
  description:
    "Acceptable use policy, operational limits, and privacy terms for JSONLive mock API service.",
};

const policyItems = [
  {
    number: "01",
    tag: "Data Handling",
    title: "Data Collection & Payload Privacy",
    content: [
      "JSONLive stores only minimal account identifiers and the JSON documents you submit to build endpoints.",
      "Resources are public by default; you can mark a resource as private to require an API key. Even so, never store sensitive credentials, payment info, or production user records.",
    ],
  },
  {
    number: "02",
    tag: "Public Access",
    title: "CORS & Public Endpoint Visibility",
    content: [
      "Endpoints automatically include open Access-Control-Allow-Origin headers so your web and mobile applications can perform fetch requests immediately.",
      "Public resources can be read by anyone possessing the URL path; private resources require a valid API key. Maintain unique resource names to prevent unintended discoveries.",
    ],
  },
  {
    number: "03",
    tag: "Traffic Rules",
    title: "Fair Use & Rate Limiting",
    content: [
      "Requests are throttled per client IP: up to 500 GET requests/minute and 100 write operations/minute to ensure host stability.",
      "Automated stress testing, abusive scraping, or denial-of-service simulations are prohibited and will result in rate-limiting or IP restriction.",
    ],
  },
  {
    number: "04",
    tag: "Capacity",
    title: "Storage Quotas & JSON Limits",
    content: [
      "Each resource payload has a maximum size cap of 5 MB. Free tier accounts can create up to 5 resources simultaneously.",
      "JSONLive is optimized for development, testing, and staging. Keep local copies of essential schemas and payloads.",
    ],
  },
  {
    number: "05",
    tag: "Service Lifecycle",
    title: "Availability & Retention",
    content: [
      "This service is self-hosted and provided for development workflows. Uptime guarantees do not cover production-critical backends.",
      "Inactive or orphan test resources may be pruned periodically to maintain optimal database performance.",
    ],
  },
  {
    number: "06",
    tag: "Security",
    title: "Platform Integrity & Content Rules",
    content: [
      "Payloads promoting illegal activities, malicious code, malware delivery, or phishing are strictly prohibited and immediately purged.",
      "Suspicious patterns and anomalies are monitored via reverse tunnel proxy safeguards.",
    ],
  },
];

export default function PolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Header & Back Action */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge tone="primary">POLICY & TERMS</Badge>
                <span className="text-xs text-muted-foreground">Version 2.0</span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                Policy & Usage Guidelines
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Rules, quotas, and service terms for creating and consuming JSONLive mock endpoints.
              </p>
            </div>
            <div>
              <ButtonLink href="/" variant="outline" size="sm">
                Back to Home
              </ButtonLink>
            </div>
          </div>

          {/* Alert Notification */}
          <Alert tone="warning" title="Development & Testing Disclaimer" className="mb-8">
            JSONLive endpoints are publicly accessible across origins. Do not upload production secrets,
            passwords, or confidential private databases.
          </Alert>

          {/* Grid Layout of Policy Items */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {policyItems.map((item) => (
              <Card key={item.number} className="h-full">
                <CardHeader
                  title={item.title}
                  description={
                    <span className="flex items-center justify-between font-mono text-xs text-muted-foreground/80">
                      <span>{item.tag}</span>
                      <span className="font-semibold text-primary">{item.number}</span>
                    </span>
                  }
                />
                <CardBody className="p-5">
                  <ul className="space-y-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {item.content.map((paragraph, idx) => (
                      <li key={idx} className="border-l-2 border-border/80 pl-3">
                        {paragraph}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Support / Contact Footer Card */}
          <div className="mt-8">
            <Card>
              <CardBody className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Questions or Abuse Reporting?
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    If you detect misuse or require support regarding these terms, reach out through GitHub or our community channels.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ButtonLink href="/thanks" variant="secondary" size="sm">
                    Special Thanks
                  </ButtonLink>
                  <ButtonLink
                    href="https://github.com/RevanandaXD"
                    variant="primary"
                    size="sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Project
                  </ButtonLink>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
