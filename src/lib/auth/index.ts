import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, magicLink } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendEmail, otpEmailHtml, magicLinkEmailHtml } from "@/lib/email";

export const auth = betterAuth({
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
    emailOTP({
      async sendVerificationOTP({ email, otp, type }: { email: string; otp: string; type: string }) {
        console.log("[NEXUS] Sending OTP to:", email, "OTP:", otp, "Type:", type);
        await sendEmail({
          to:      email,
          subject: "Your NEXUS sign-in code",
          html:    otpEmailHtml(otp),
        });
        console.log("[NEXUS] OTP email sent successfully to:", email);
      },
      otpLength:          6,
      expiresIn:          600,
      sendVerificationOnSignUp: true,
    }),
    magicLink({
      async sendMagicLink({ email, url }: { email: string; url: string }) {
        console.log("[NEXUS] Sending magic link to:", email);
        await sendEmail({
          to:      email,
          subject: "Sign in to NEXUS",
          html:    magicLinkEmailHtml(url),
        });
        console.log("[NEXUS] Magic link sent successfully to:", email);
      },
      expiresIn: 900,
    }),
  ],
});
