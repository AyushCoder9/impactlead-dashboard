import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

// Real authorization boundary for /admin — the proxy.ts redirect is only an
// optimistic UX shortcut, this server-side check is what actually gates
// access. Every page/action under here re-checks independently too.
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminShell userEmail={session.user.email}>{children}</AdminShell>;
}
