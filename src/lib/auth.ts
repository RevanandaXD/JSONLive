import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    emailAndPassword: {
        enabled: true,
    },
    rateLimit: {
        enabled: true,
        window: 60,
        max: 5,
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
    // Next Update
    // socialProviders: {
    //     github: {
    //         clientId, clientSecret
    //     }
    // }
})