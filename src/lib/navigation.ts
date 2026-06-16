export type NavItem = {
  href: string;
  label: string;
  disabled?: boolean;
};

export const clientNavItems: NavItem[] = [
  { href: "/app", label: "Resumo" },
  { href: "/app/calculadora", label: "Calculadora" },
  { href: "/app/simulacoes", label: "Simulações" }
];

export const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/cotacoes", label: "Cotações" },
  { href: "/admin/simulacoes", label: "Simulações" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/fornecedores", label: "Fornecedores", disabled: true },
  { href: "/admin/despachantes", label: "Despachantes", disabled: true },
  { href: "/admin/parametros", label: "Parâmetros", disabled: true }
];
