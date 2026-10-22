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
    email: process.env.ADMIN_EMAIL as string,
    name: "admin",
    role: "admin",
    username: process.env.ADMIN_USERNAME as string,
    password: process.env.ADMIN_PASSWORD as string,
  },
  {
    email: "nadia.putri@gmail.com",
    name: "Nadia Putri",
    role: "user",
    username: "nadia",
    password: "Nad!a_9264",
  },
  {
    email: "farhan.pratama@gmail.com",
    name: "Farhan Pratama",
    role: "user",
    username: "farhan",
    password: "FhP@2026_317",
  },
  {
    email: "rizky.maulana@gmail.com",
    name: "Rizky Maulana",
    role: "user",
    username: "rizky",
    password: "Rzk#Mln_605",
  },
];

async function hashPassword(password: string): Promise<string> {
  const { hashPassword } = await import("better-auth/crypto");
  return hashPassword(password);
}

async function main() {
  console.log("Seeding database...\n");

  for (const userData of USERS) {
    const passwordHash = await hashPassword(userData.password);

    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    const usernameOwner = await prisma.user.findUnique({
      where: { username: userData.username }
    })

    if (usernameOwner && usernameOwner.id !== existingUser?.id) throw new Error(
      `Username ${userData.username} already exists`
    )

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        username: userData.username,
        role: userData.role,
        emailVerified: true,
      },
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        emailVerified: true,
        username: userData.username,
      },
    });

    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { accountId: user.id, password: passwordHash },
      });
    } else {
      await prisma.account.create({
        data: {
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password: passwordHash,
        },
      });
    }

    console.log(`User: ${user.name} (${user.email}) username=${user.username}`);
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
