import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";
import prisma from "./prisma";

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
        "http://localhost:4500"
    ],
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    plugins: [blockDisabledUser],
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
                max: 3
            }
        }
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
            }
        }
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
                        while (await prisma.user.findUnique({ where: { username: candidate } })) {
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