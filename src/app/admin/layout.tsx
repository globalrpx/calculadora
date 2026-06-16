import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/get-session-profile";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/fornecedores", label: "Fornecedores" },
  { href: "/admin/despachantes", label: "Despachantes" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/parametros", label: "Parametros" },
  { href: "/admin/cotacoes", label: "Cotacoes" },
  { href: "/admin/simulacoes", label: "Simulacoes" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("admin");

  return (
    <AppShell profile={profile} navItems={navItems} tone="admin">
      {children}
    </AppShell>
  );
}
