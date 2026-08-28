import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserProfile } from "@/repositories/organisation.repository";

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const profile = await getUserProfile(session.user.id);

  if (!profile) {
    redirect("/setup");
  }

  return <>{children}</>;
}
