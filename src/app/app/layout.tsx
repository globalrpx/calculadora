import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/get-session-profile";
import { clientNavItems } from "@/lib/navigation";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { appUser } = await requireRole("client");

  return (
    <AppShell appUser={appUser} navItems={clientNavItems}>
      {children}
    </AppShell>
  );
}
