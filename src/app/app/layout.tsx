import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/get-session-profile";

const navItems = [
  { href: "/app", label: "Resumo" },
  { href: "/app/calculadora", label: "Calculadora" },
  { href: "/app/simulacoes", label: "Simulacoes" }
];

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { appUser } = await requireRole("client");

  return (
    <AppShell appUser={appUser} navItems={navItems}>
      {children}
    </AppShell>
  );
}
