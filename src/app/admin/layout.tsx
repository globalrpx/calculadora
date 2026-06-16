import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/get-session-profile";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/fornecedores", label: "Fornecedores" },
  { href: "/admin/despachantes", label: "Despachantes" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/parametros", label: "Parâmetros" },
  { href: "/admin/cotacoes", label: "Cotações" },
  { href: "/admin/simulacoes", label: "Simulações" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser } = await requireRole("admin");

  return (
    <AppShell appUser={appUser} navItems={navItems} tone="admin">
      {children}
    </AppShell>
  );
}
