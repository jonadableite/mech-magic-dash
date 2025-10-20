import { betterAuth } from "better-auth";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  baseURL: "http://localhost:3000",
  secret: "your-secret-key-here-change-in-production",
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
});
