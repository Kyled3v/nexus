import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/repositories/organisation.repository";

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  let shouldRedirectSignIn = false;
  let shouldRedirectSetup = false;

  const isDevBypass = process.env.NEXT_PUBLIC_DEV_MODE !== "false" || !process.env.DATABASE_URL;

  if (!isDevBypass) {
    try {
      const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);

      if (!session?.user) {
        shouldRedirectSignIn = true;
      } else {
        const profile = await getUserProfile(session.user.id).catch(() => null);
        if (!profile) {
          shouldRedirectSetup = true;
        }
      }
    } catch {
      shouldRedirectSignIn = true;
    }
  }

  if (shouldRedirectSignIn) {
    redirect("/sign-in");
  }
  if (shouldRedirectSetup) {
    redirect("/setup");
  }

  return <>{children}</>;
}
