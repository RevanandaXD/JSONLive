import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";
import prisma from "./prisma";

async function verifyTurnstileToken(
  token: string | undefined,
  ip?: string,
): Promise<boolean> {
  if (!token || typeof token !== "string" || token.length > 2048) return false;
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(10_000),
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY || "",
          response: token,
          ...(ip ? { remoteip: ip } : {}),
        }),
      },
    );
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.success);
  } catch {
    return false;
  }
}

const turnstileBotProtection = {
  id: "turnstile-bot-protection",
  hooks: {
    before: [
      {
        matcher: (ctx: { path?: string; method?: string }) =>
          ctx.path === "/sign-up/email" && ctx.method === "POST",
        handler: createAuthMiddleware(async (ctx) => {
          const body = ctx.body as { turnstileToken?: string } | undefined;
          const token = body?.turnstileToken;
          const clientIp =
            ctx.headers?.get("cf-connecting-ip") ||
            ctx.headers?.get("x-forwarded-for")?.split(",")[0] ||
            undefined;
          const isValid = await verifyTurnstileToken(token, clientIp);
          if (!isValid) {
            throw new APIError("BAD_REQUEST", {
              message: "Bot verification failed. Please refresh and try again.",
            });
          }
        }),
      },
    ],
  },
};

const blockDisabledUser = {
  id: "block-disabled-user",
  hooks: {
    before: [
      {
        matcher: (ctx: { path?: string; method?: string }) =>
          ctx.path === "/sign-in/email" && ctx.method === "POST",
        handler: createAuthMiddleware(async (ctx) => {
          const email = (ctx.body as { email?: string } | undefined)?.email;
          if (!email) return;
          const user = await prisma.user.findUnique({
            where: { email },
            select: { disabled: true },
          });
          if (user?.disabled) {
            throw new APIError("FORBIDDEN", {
              message: "Account has been disabled by an administrator.",
            });
          }
        }),
      },
    ],
  },
};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "https://jsonlive.revandev.my.id",
    "http://localhost:3000",
    "http://localhost:4500",
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [blockDisabledUser, turnstileBotProtection],
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-up/email": {
        window: 60,
        max: 3,
      },
    },
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
      maxResource: {
        type: "number",
        required: false,
        defaultValue: 5,
        input: false,
      },
      deleteRequestedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          let username = (user as { username?: string }).username;
          if (!username) {
            const raw = (user.name || user.email?.split("@")[0] || "user")
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "");
            let base = raw.slice(0, 15);
            if (base.length < 3) base = `user_${base}`.slice(0, 15);

            let candidate = base;
            let counter = 1;
            while (
              await prisma.user.findUnique({ where: { username: candidate } })
            ) {
              candidate = `${base.slice(0, 12)}${counter++}`;
            }
            username = candidate;
          }

          return {
            data: {
              ...user,
              username,
              role: (user as { role?: string }).role || "user",
            },
          };
        },
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
