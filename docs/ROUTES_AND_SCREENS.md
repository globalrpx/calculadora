# Global RPX - Rotas e Telas

Status:

- **Pronto**: fluxo funcional para a fase mock.
- **Parcial**: interface existe, mas faltam persistencia ou operacoes.
- **Pendente**: rota ainda nao existe.

| Rota | Tela | Objetivo | Componentes principais | Status | Melhorias |
|---|---|---|---|---|---|
| `/` | Home publica | Apresentar a plataforma e levar ao login | `Brand`, `ButtonLink` | Parcial | Atualizar textos, revisar responsividade e proposta comercial |
| `/login` | Login | Autenticar admin ou cliente | `Brand`, `Button`, `signInAction` | Parcial | Supabase real, recuperacao de senha, mensagens por erro |
| `/app` | Resumo do cliente | Mostrar indicadores e proximas acoes | `AppShell`, `PageHeader`, `Card` | Parcial | Dados reais, links acionaveis e atividade recente |
| `/app/calculadora` | Calculadora | Criar cotacao preliminar | `CalculatorClient`, `FormField`, `DataTable` | Parcial | Supabase, Storage, decomposicao do componente e testes |
| `/app/simulacoes` | Simulacoes do cliente | Listar simulacoes publicadas | `PageHeader`, `Card` | Parcial | Listagem, filtros, detalhe e arquivos |
| `/admin` | Entrada admin | Redirecionar ao dashboard | `redirect` | Pronto | Nenhuma relevante |
| `/admin/dashboard` | Dashboard | Visao geral operacional | `PageHeader`, `Card` | Parcial | Metricas e consultas reais |
| `/admin/clientes` | Clientes | Listar e cadastrar clientes | `PageHeader`, `Button`, `TablePlaceholder` | Parcial | CRUD, busca, detalhe e status |
| `/admin/fornecedores` | Fornecedores | Base compartilhada de fornecedores | `PageHeader`, `Button`, `TablePlaceholder` | Parcial | CRUD, deduplicacao e vinculos |
| `/admin/despachantes` | Despachantes | Cadastro operacional futuro | `PageHeader`, `Button`, `TablePlaceholder` | Parcial | Definir prioridade e modelo |
| `/admin/usuarios` | Usuarios | Gerenciar acessos e perfis | `PageHeader`, `Button`, `TablePlaceholder` | Parcial | Convites, roles e desativacao |
| `/admin/parametros` | Parametros | Configurar fatores internos | `PageHeader`, `Card` | Parcial | Formulario, versionamento e auditoria |
| `/admin/cotacoes` | Cotacoes | Visualizar cotacoes dos clientes | `PageHeader`, `TablePlaceholder` | Parcial | Tabela real, filtros, status e detalhe |
| `/admin/simulacoes` | Simulacoes admin | Criar e publicar analises | `PageHeader`, `Button`, `TablePlaceholder` | Parcial | Editor completo, versoes e publicacao |
| `/api/exchange-rate` | API de cambio | Consultar PTAX e aplicar ajuste interno | Route Handler, `getCurrentExchangeRate` | Pronto | Observabilidade, timeout e estrategia de indisponibilidade |

## Rotas protegidas

- `/app` e descendentes exigem role `client`.
- `/admin` e descendentes exigem role `admin`.
- O middleware redireciona usuarios sem sessao para `/login`.
- Admin tentando acessar `/app` volta para `/admin/dashboard`.
- Cliente tentando acessar `/admin` volta para `/app`.

## Rotas recomendadas ainda pendentes

| Rota | Finalidade |
|---|---|
| `/app/cotacoes` | Historico dedicado, separado da aba da calculadora |
| `/app/cotacoes/[id]` | Detalhe persistido da cotacao |
| `/app/simulacoes/[id]` | Detalhe publicado para cliente |
| `/admin/clientes/[id]` | Perfil e usuarios do cliente |
| `/admin/fornecedores/[id]` | Dados e cotacoes vinculadas |
| `/admin/cotacoes/[id]` | Validacao Brasil e criacao de simulacao |
| `/admin/simulacoes/[id]` | Editor e publicacao |
| `/auth/forgot-password` | Recuperacao de senha |
| `/auth/callback` | Callback de convite/recuperacao, se adotado |

## Componentes transversais

- `AppShell`: layout protegido.
- `PageHeader`: titulo, descricao e acao.
- `Button`/`ButtonLink`: comandos.
- `Card`: indicadores.
- `DataTable`: tabela funcional generica.
- `TablePlaceholder`: somente fundacao.
- `FormField`, `TextInput`, `NumberInput`: formulario.
- `EmptyState`: ausencia de dados.

