import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  }),
});

const USERS = [
  {
    email: "demo@jsonlive.com",
    name: "Revan",
    username: "revan",
    password: "password123",
  },
  {
    email: "budi@jsonlive.com",
    name: "Budi",
    username: "budi",
    password: "password123",
  },
];

const RESOURCES: Record<
  string,
  { name: string; slug: string; data: unknown }[]
> = {
  revan: [
    {
      name: "Users",
      slug: "users",
      data: [
        { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
        { id: 2, name: "Bob", email: "bob@example.com", role: "user" },
        { id: 3, name: "Charlie", email: "charlie@example.com", role: "user" },
      ],
    },
  ],
  budi: [
    {
      name: "Users",
      slug: "users",
      data: [
        { id: 1, name: "Diana", email: "diana@example.com", role: "user" },
        { id: 2, name: "Eve", email: "eve@example.com", role: "admin" },
      ],
    },
  ],
};

async function hashPassword(password: string): Promise<string> {
  const { hashPassword } = await import("better-auth/crypto");
  return hashPassword(password);
}

async function main() {
  console.log("Seeding database...\n");

  for (const userData of USERS) {
    const passwordHash = await hashPassword(userData.password);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { name: userData.name, username: userData.username },
      create: {
        email: userData.email,
        name: userData.name,
        emailVerified: true,
        username: userData.username,
        accounts: {
          create: {
            accountId: userData.email,
            providerId: "credential",
            password: passwordHash,
          },
        },
      },
      include: { accounts: true },
    });

    if (user.accounts.length === 0) {
      await prisma.account.create({
        data: {
          accountId: userData.email,
          providerId: "credential",
          userId: user.id,
          password: passwordHash,
        },
      });
    }

    console.log(`User: ${user.name} (${user.email}) username=${user.username}`);

    const resources = RESOURCES[userData.username] ?? [];

    for (const resource of resources) {
      const existing = await prisma.resource.findFirst({
        where: { userId: user.id, slug: resource.slug },
      });

      if (existing) {
        await prisma.resource.update({
          where: { id: existing.id },
          data: { data: resource.data, name: resource.name },
        });
      } else {
        await prisma.resource.create({
          data: {
            userId: user.id,
            name: resource.name,
            slug: resource.slug,
            data: resource.data,
          },
        });
      }
      console.log(`  Resource: ${resource.name} (/${user.username}/${resource.slug})`);
    }
  }

  console.log("\n--- Done ---");
  console.log("Login accounts:");
  for (const u of USERS) {
    console.log(`  ${u.email} / ${u.password} (username: ${u.username})`);
  }
  console.log("Public endpoints:");
  console.log("  GET /api/revan/users");
  console.log("  GET /api/budi/users");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
