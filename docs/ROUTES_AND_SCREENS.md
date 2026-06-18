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
| `/admin/simulacoes/[id]` | Admin | Funcional | `simulations`, `quotes`, `clients` | Detalhe e edição de status, observações e referência de arquivo. |
| `/admin/usuarios` | Admin | Parcial | `app_users` | Base inicial de usuarios admin. |
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
| `/auth/forgot-password` | Recuperacao de senha. |
| `/auth/callback` | Callback de convite/recuperacao, se adotado. |

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
- `FormField`, `TextInput`, `NumberInput`: formularios.
- `EmptyState`: ausencia de dados.
- `TablePlaceholder`: somente para telas ainda placeholder.
