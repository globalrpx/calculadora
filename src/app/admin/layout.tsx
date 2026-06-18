import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/get-session-profile";
import { adminNavItems } from "@/lib/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser } = await requireRole("admin");

  return (
    <AppShell appUser={appUser} navItems={adminNavItems} variant="admin">
      {children}
    </AppShell>
  );
}
