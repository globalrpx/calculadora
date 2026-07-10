# Global RPX - Rotas e Telas

## Status

- **Funcional**: fluxo principal implementado e conectado ao estado real atual.
- **Parcial**: tela existe e possui base real, mas ainda falta refinamento de CRUD, detalhe ou operacao completa.
- **Placeholder**: rota existe como estrutura visual, mas ainda sem fluxo operacional completo.
- **Futuro**: rota recomendada ainda nao existe.

## Rotas Atuais

| Rota | Publico | Status | Fonte de dados | Observacoes |
|---|---|---|---|---|
| `/` | Publico | Funcional | Estatico/componentes | Home publica da plataforma. |
| `/login` | Publico | Funcional | Supabase Auth ou mock fallback | Redireciona conforme role em `app_users`. |
| `/cadastro` | Publico | Funcional | Supabase Auth + dados da app | Cadastro publico de cliente. |
| `/esqueci-senha` | Publico | Funcional | Supabase Auth | Solicita link nativo de recuperacao de senha sem revelar se o e-mail existe. |
| `/auth/callback` | Publico | Funcional | Supabase Auth | Troca o `code` do Supabase por sessao SSR e redireciona para path interno seguro. |
| `/redefinir-senha` | Publico | Funcional | Supabase Auth + `app_users` | Permite definir nova senha a partir da sessao de recuperacao; exige conta ativa. |
| `/termos` | Publico | Funcional | Estatico | Documento legal/termos. |
| `/privacidade` | Publico | Funcional | Estatico | Politica de privacidade. |
| `/logout` | Autenticado | Funcional | Auth/session | Encerra sessao. |
| `/conta` | Autenticado | Parcial | `app_users` | Area de conta do usuario autenticado. |
| `/app` | Cliente | Funcional | `quotes`, `simulations` | Dashboard do cliente com dados reais. |
| `/app/calculadora` | Cliente | Funcional | PTAX + `quotes` | Calculadora persiste cotacoes reais e exibe historico. |
| `/app/simulacoes` | Cliente | Parcial | `simulations`, `quotes` | Lista solicitacoes/simulacoes vinculadas ao cliente. |
| `/admin` | Admin | Funcional | Redirect | Entrada administrativa redireciona ao dashboard. |
| `/admin/dashboard` | Admin | Funcional | `clients`, `quotes`, `simulations` | Contadores dinamicos. |
| `/admin/clientes` | Admin | Funcional | `clients`, `app_users` | CRUD completo com filtros, paginacao, ordenacao, badges e inativacao. |
| `/admin/clientes/novo` | Admin | Funcional | Supabase Auth + `clients` + `app_users` | Criacao com validacao inline server-side. |
| `/admin/clientes/[id]` | Admin | Funcional | `clients`, `app_users` | Edicao com senha opcional e validacao inline. |
| `/admin/cotacoes` | Admin | Funcional | `quotes`, `clients`, `simulations` | Listagem read-only padronizada com filtros, totalizador, paginacao, ordenacao segura e acao de detalhe. |
| `/admin/cotacoes/[id]` | Admin | Funcional | `quotes`, `clients`, `simulations` | Detalhe administrativo read-only da cotacao. |
| `/admin/simulacoes` | Admin | Funcional | `simulations`, `quotes`, `clients` | CRUD administrativo básico com filtros, totalizador, paginação, ordenação segura, status e ações. |
| `/admin/simulacoes/nova` | Admin | Funcional | `simulations`, `quotes`, `clients` | Criação administrativa básica usando campos existentes; sem upload real nesta fase. |
| `/admin/simulacoes/[id]` | Admin | Funcional | `simulations`, `quotes`, `clients`, `uploads`, Storage | Detalhe e edição de status/observações, com upload real de múltiplos arquivos da simulação via bucket privado. |
| `/admin/simulacoes-finais` | Admin | Parcial | `final_simulations` | Listagem inicial do novo módulo, com filtros simples e ações de abrir/editar. |
| `/admin/simulacoes-finais/nova` | Admin | Parcial | `final_simulations`, `clients` | Criação dos dados principais em status `draft`; produtos e cálculo avançado entram depois. |
| `/admin/simulacoes-finais/[id]` | Admin | Parcial | `final_simulations`, `simulation_tax_lines` | Detalhe com dados principais, produtos, despesas, parametrização fiscal, recálculo fiscal V1, resumo salvo e linhas fiscais por produto. |
| `/admin/simulacoes-finais/[id]/editar` | Admin | Parcial | `final_simulations`, `clients` | Edição dos dados principais; bloqueio de edição comum para status finais via action. |
| `/admin/simulacoes-finais/[id]/preview-cliente` | Admin | Parcial | `final_simulations`, `final_simulation_items`, `simulation_tax_lines`, `simulation_expense_lines`, `calculation_snapshot`, `public_snapshot` | Preview HTML do PDF cliente para validação visual, geração dos snapshots e acesso ao PDF temporário. |
| `/admin/simulacoes-finais/[id]/pdf-cliente` | Admin | Parcial | `final_simulations.public_snapshot` | Rota temporária que gera PDF cliente em memória a partir do `public_snapshot`; não grava Storage nem cria `simulation_documents`. |
| `/admin/cadastros/tipos-despesa` | Admin | Parcial | `expense_types` | Listagem e inativação de tipos mestres de despesa. |
| `/admin/cadastros/tipos-despesa/novo` | Admin | Parcial | `expense_types` | Criação de tipo mestre de despesa. |
| `/admin/cadastros/tipos-despesa/[id]/editar` | Admin | Parcial | `expense_types` | Edição de tipo mestre de despesa. |
| `/admin/cadastros/pre-calculos-despesas` | Admin | Parcial | `expense_presets` | Listagem e inativação de pré-cálculos de despesas. |
| `/admin/cadastros/pre-calculos-despesas/novo` | Admin | Parcial | `expense_presets` | Criação de pré-cálculo de despesas. |
| `/admin/cadastros/pre-calculos-despesas/[id]/editar` | Admin | Parcial | `expense_presets`, `expense_preset_items`, `expense_types` | Edição de pré-cálculo e gestão dos itens do preset. |
| `/admin/cadastros/parametrizacoes-fiscais` | Admin | Parcial | `invoice_parametrizations` | Listagem, filtros e ativação/inativação de parametrizações fiscais. |
| `/admin/cadastros/parametrizacoes-fiscais/nova` | Admin | Parcial | `invoice_parametrizations` | Criação de parametrização fiscal de NF entrada/saída. |
| `/admin/cadastros/parametrizacoes-fiscais/[id]/editar` | Admin | Parcial | `invoice_parametrizations` | Edição de parametrização fiscal. |
| `/admin/configuracoes` | Admin | Funcional | `config` | Lista, cria e edita configuracoes globais; `import_factor` controla o fator RPX de novas cotacoes. |
| `/admin/usuarios` | Admin | Funcional | `app_users` | CRUD de usuarios admin com filtros, totalizador, paginacao, ordenacao segura, status e acoes. |
| `/admin/usuarios/novo` | Admin | Funcional | Supabase Auth + `app_users` | Criacao de usuario admin com senha obrigatoria e validacao inline. |
| `/admin/usuarios/[id]` | Admin | Funcional | Supabase Auth + `app_users` | Edicao de usuario admin, status e senha opcional. |
| `/admin/fornecedores` | Admin | Placeholder | Estatico/estrutura | CRUD futuro. |
| `/admin/despachantes` | Admin | Placeholder | Estatico/estrutura | CRUD futuro. |
| `/admin/parametros` | Admin | Placeholder | Estatico/estrutura | Parametros versionados futuros. |
| `/api/exchange-rate` | Sistema | Funcional | Banco Central PTAX | Consulta server-side e retorna taxa interna para calculo. |

## Rotas Protegidas

- `/app` e descendentes exigem role `client`.
- `/admin` e descendentes exigem role `admin`.
- Usuario sem sessao e enviado para `/login`.
- Admin tentando acessar area cliente volta para `/admin/dashboard`.
- Cliente tentando acessar area admin volta para `/app`.
- A fonte de verdade para role/status e `app_users`.

## Rotas Recomendadas Ainda Futuras

| Rota | Finalidade |
|---|---|
| `/app/cotacoes` | Historico dedicado, separado da aba da calculadora. |
| `/app/cotacoes/[id]` | Detalhe persistido da cotacao. |
| `/app/simulacoes/[id]` | Detalhe publicado para cliente. |
| `/auth/forgot-password` | Alias futuro opcional para recuperacao de senha, se adotado. |

## Componentes Transversais

- `AppShell`: layout protegido.
- `PageHeader`: titulo, descricao e acoes.
- `Button`/`ButtonLink`: comandos.
- `Card`: blocos e indicadores.
- `CrudHeaderWithFilters`: cabecalho/filtros de CRUD admin.
- `DataTable`: tabela funcional generica.
- `StatusBadge`: status compartilhado.
- `ConfirmDialog`: confirmacao de acao sensivel.
- `DismissibleAlert`: feedback fechavel.
- `UploadsCard`: upload/listagem/substituicao/exclusao de arquivos via Supabase Storage privado.
- `FormField`, `TextInput`, `NumberInput`: formularios.
- `EmptyState`: ausencia de dados.
- `TablePlaceholder`: somente para telas ainda placeholder.
