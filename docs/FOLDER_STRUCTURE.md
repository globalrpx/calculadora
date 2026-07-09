# Global RPX - Estrutura de Pastas

## Visao Resumida

```text
app-rpx/
├── data/
├── docs/
├── public/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── supabase/
│   └── migrations/
├── middleware.ts
├── package.json
├── state.md
└── agents.md
```

## `src/app`

App Router do Next.js. Cada `page.tsx` representa uma rota; `layout.tsx` compartilha estrutura.

Rotas publicas e de conta:

- `page.tsx`: home publica.
- `login/page.tsx`: login.
- `cadastro/page.tsx`: cadastro publico.
- `conta/page.tsx`: area de conta do usuario autenticado.
- `termos/page.tsx`: termos.
- `privacidade/page.tsx`: privacidade.
- `logout/route.ts`: logout.

Area do cliente:

- `app/layout.tsx`: layout protegido do cliente.
- `app/page.tsx`: dashboard/resumo do cliente com dados reais.
- `app/calculadora/page.tsx`: calculadora e historico de cotacoes.
- `app/simulacoes/page.tsx`: simulacoes/solicitacoes do cliente.

Area administrativa:

- `admin/layout.tsx`: layout protegido do admin.
- `admin/page.tsx`: entrada admin/redirecionamento.
- `admin/dashboard/page.tsx`: dashboard administrativo dinamico.
- `admin/clientes/page.tsx`: listagem/CRUD de clientes.
- `admin/clientes/novo/page.tsx`: criacao de cliente.
- `admin/clientes/[id]/page.tsx`: edicao de cliente.
- `admin/cotacoes/page.tsx`: listagem administrativa inicial de cotacoes.
- `admin/simulacoes/page.tsx`: listagem administrativa inicial de simulacoes.
- `admin/usuarios/page.tsx`: base administrativa inicial de usuarios.
- `admin/fornecedores/page.tsx`, `admin/despachantes/page.tsx`, `admin/parametros/page.tsx`: telas administrativas ainda parciais/placeholder.

API:

- `api/exchange-rate/route.ts`: consulta server-side da PTAX.
- `globals.css`: estilos globais.

## `src/components`

Componentes React reutilizaveis e por dominio.

- `admin/`: componentes do CRUD administrativo de Clientes e cabecalho/filtros reutilizaveis.
- `calculator/CalculatorClient.tsx`: experiencia da calculadora, historico e solicitacao de simulacao.
- `landing/`: home publica.
- `layout/`: `AppShell`, logo, menus, conta, navegacao e cabecalho.
- `uploads/`: componentes reutilizaveis para anexos no Supabase Storage privado.
- `ui/`: botoes, cards, tabela, alertas, campos, modal de confirmacao, badges e estados vazios.

## `src/lib`

Regras, auth, actions, queries e integracoes.

- `actions/`: Server Actions de auth, conta, admin e cotacoes do cliente.
- `admin/`: tipos/queries administrativas e estado de formulario de cliente.
- `auth/`: sessao, roles, mock fallback e `app_users`.
- `calculator/`: formulas e tipos de calculo.
- `client/`: helpers e tipos de cotacoes/simulacoes do cliente.
- `exchange-rate/`: consulta PTAX.
- `supabase/`: clients browser/server/admin, config e middleware.
- `uploads/`: Server Actions e regras de validacao para tabela `uploads` e bucket `app-uploads`.
- `navigation.ts`: navegacao compartilhada.
- `types.ts`: tipos compartilhados, incluindo `AppUser`.

## `supabase/migrations`

SQL versionado. Atualmente existem multiplas migrations:

- `001_foundation.sql`: fundacao com `clients`, `profiles` legado e RLS inicial.
- `002_public_signup_profiles.sql`: trigger inicial de perfil publico, posteriormente substituido.
- `003_app_users.sql`: cria `app_users` e muda `is_admin()` para usar `app_users`.
- `004_admin_foundation.sql`: base admin, `quotes`, `simulations` e policies iniciais.
- `005_crud_soft_delete.sql`: `deleted_at`, status e indices para soft delete.
- `006_client_quotes_persistence.sql`: persistencia da calculadora, fatores, imagens como URLs e solicitacoes em `simulations`.
- `20260709134047_create_uploads_table_and_storage_bucket.sql`: bucket privado `app-uploads`, tabela `uploads`, RLS e policies de Storage para anexos administrativos.

Nao editar migrations ja aplicadas sem pedido explicito. Criar migrations incrementais para evolucao de banco.

## `public`

Arquivos servidos diretamente:

- `logo-global-rpx-horizontal.png`.
- `data/ncm.json`: base NCM normalizada para autocomplete.

## `data`

Dados-fonte que nao precisam ser servidos ao navegador:

- `ncm-oficial.json`: fonte completa usada na normalizacao.

## `scripts`

- `build-ncm-data.mjs`: gera o dataset enxuto de NCM.
- `preview-server.mjs`: preview temporario/fallback sem Next.js.

## `docs`

Documentacao de produto, arquitetura, banco, rotas, CRUDs, calculadora, permissoes, stack, UI/UX, backlog e status.

## Arquivos Operacionais

- `state.md`: memoria viva do andamento.
- `agents.md`: regras para agentes/desenvolvedores.
- `middleware.ts`: entrada do middleware Next.
- `.env.example`: variaveis esperadas.
- `vercel.json`: configuracao Vercel, mantendo deploy automatico por push desabilitado conforme orientacao do projeto.

## Pontos de Atencao

1. `CalculatorClient.tsx` ainda concentra bastante logica e pode ser dividido gradualmente.
2. `preview-server.mjs` duplica parte da experiencia e deve permanecer apenas como fallback.
3. CRUDs de Cotacoes, Usuarios e Simulacoes precisam seguir o padrao documentado em `docs/spec-cruds.md`.
4. Storage real para anexos administrativos usa `app-uploads`; imagens da calculadora ainda precisam ser migradas.
5. `profiles` existe como legado, mas novas implementacoes devem usar `app_users`.
