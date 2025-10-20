import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: "http://localhost:3000",
  secret: "your-secret-key-here-change-in-production",
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
});
