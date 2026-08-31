import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendEmail, magicLinkEmailHtml } from "@/lib/email";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || "nexus-dev-secret-key-32-chars-long-min-auth",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user:         schema.user,
      session:      schema.session,
      account:      schema.account,
      verification: schema.verification,
    },
  }),
  session: {
    expiresIn:   60 * 60 * 24 * 30,
    updateAge:   60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  plugins: [
    magicLink({
      async sendMagicLink({ email, url }: { email: string; url: string }) {
        console.log("[NEXUS] Sending magic link to:", email);
        await sendEmail({
          to:      email,
          subject: "Sign in to NEXUS",
          html:    magicLinkEmailHtml(url),
        });
      },
      expiresIn: 900,
    }),
  ],
});
