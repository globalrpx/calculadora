export type NavItem = {
  href: string;
  label: string;
  disabled?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const clientNavItems: NavItem[] = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/calculadora", label: "Calculadora" },
  { href: "/app/simulacoes", label: "Simulações" }
];

export const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/cotacoes", label: "Cotações" },
  { href: "/admin/simulacoes", label: "Simulações" },
  { href: "/admin/simulacoes-finais", label: "Simulações Finais" },
  { href: "/admin/cadastros/tipos-despesa", label: "Tipos de Despesa" },
  { href: "/admin/cadastros/pre-calculos-despesas", label: "Pré-cálculos" },
  { href: "/admin/cadastros/parametrizacoes-fiscais", label: "Parametrizações Fiscais" },
  { href: "/admin/configuracoes", label: "Configurações" },
  { href: "/admin/usuarios", label: "Usuários" }
];

export const adminNavGroups: NavGroup[] = [
  {
    label: "Painel Administrativo",
    items: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/clientes", label: "Clientes" },
      { href: "/admin/cotacoes", label: "Cotações" },
      { href: "/admin/simulacoes", label: "Simulações" }
    ]
  },
  {
    label: "Back Office",
    items: [
      { href: "/admin/simulacoes-finais", label: "Simulações Finais" },
      { href: "/admin/cadastros/tipos-despesa", label: "Tipos de Despesa" },
      { href: "/admin/cadastros/pre-calculos-despesas", label: "Pré-cálculos" },
      { href: "/admin/cadastros/parametrizacoes-fiscais", label: "Parametrizações Fiscais" }
    ]
  },
  {
    label: "Gerenciar",
    items: [
      { href: "/admin/configuracoes", label: "Configurações" },
      { href: "/admin/usuarios", label: "Usuários" }
    ]
  }
];
