# Contexto para Continuacao por Outra IA ou Dev

## Leia Primeiro

1. `agents.md`
2. `state.md`
3. `docs/AI_CONTEXT.md`
4. O documento especifico da tarefa:
   - CRUDs admin: `docs/spec-cruds.md`
   - Calculadora/cotacoes/imagens: `docs/especificacao-calculadora.md`
   - Banco: `docs/DATABASE_MODEL.md`
   - Auth/permissoes: `docs/AUTH_AND_PERMISSIONS.md`
   - Rotas: `docs/ROUTES_AND_SCREENS.md`

`state.md` e a memoria viva do projeto. Este arquivo e um resumo rapido para retomar contexto.

## Contexto do Negocio

A Global RPX atua com importacao e apoio a clientes que pesquisam produtos, fornecedores e custos. A plataforma deve substituir informacoes dispersas em cadernos, planilhas e conversas por um fluxo simples de cotacao preliminar, validacao da equipe RPX e simulacao publicada.

Nao transformar o produto em ERP completo no MVP.

## Stack Atual

- Next.js 15 com App Router.
- React 19.
- TypeScript.
- Tailwind CSS.
- Supabase Auth e Postgres.
- Supabase Storage preparado para anexos futuros.
- Vercel como alvo de deploy.
- PTAX Banco Central via route handler server-side.

Nao tratar o projeto como Vite.

## Estado Atual Resumido

- Supabase real e autenticacao real estao funcionando quando as envs estao configuradas.
- `app_users` e a fonte de verdade da aplicacao para usuario, role, status e vinculo com cliente.
- `profiles` existe como legado/fundacao inicial, mas nao deve orientar novas implementacoes.
- Area do cliente existe e esta protegida por role `client`.
- Area administrativa existe e esta protegida por role `admin`.
- Calculadora persiste cotacoes reais em `quotes`.
- Historico da calculadora carrega dados reais do Supabase.
- Solicitacao de simulacao completa cria registros reais em `simulations`.
- Dashboard do cliente e dashboard admin usam dados dinamicos.
- CRUD administrativo de Clientes esta completo e e a referencia para proximos CRUDs.
- Modo mock e preview local continuam como fallback/apoio, nao como fluxo principal.

## Rotas Principais

Publicas:

- `/`
- `/login`
- `/cadastro`
- `/termos`
- `/privacidade`

Conta:

- `/conta`

Cliente:

- `/app`
- `/app/calculadora`
- `/app/simulacoes`

Admin:

- `/admin`
- `/admin/dashboard`
- `/admin/clientes`
- `/admin/clientes/novo`
- `/admin/clientes/[id]`
- `/admin/cotacoes`
- `/admin/simulacoes`
- `/admin/usuarios`
- `/admin/fornecedores`
- `/admin/despachantes`
- `/admin/parametros`

API:

- `/api/exchange-rate`

## Tabelas Principais Atuais

- `clients`: clientes/empresas, com `source`, `status` e `deleted_at`.
- `app_users`: fonte de verdade da aplicacao para usuarios, roles, status e vinculo com `client_id`.
- `profiles`: legado da fundacao inicial, nao usar como fonte principal.
- `quotes`: cotacoes preliminares persistidas pela calculadora.
- `simulations`: solicitacoes/simulacoes vinculadas a clientes e, quando aplicavel, cotacoes.

Migrations atuais vao de `001_foundation.sql` ate `006_client_quotes_persistence.sql`.

## Regras Criticas

- Seguir `agents.md` antes de editar.
- Seguir `docs/spec-cruds.md` para CRUDs administrativos.
- Seguir `docs/especificacao-calculadora.md` para calculadora, cotacoes, historico e imagens.
- Usar `app_users` para perfil, role, status e vinculo com cliente.
- Nao usar `profiles` como fonte principal da aplicacao.
- Dados de cliente precisam respeitar isolamento por `client_id` e RLS.
- Nunca enviar `SUPABASE_SERVICE_ROLE_KEY` ao client.
- Acoes administrativas sensiveis devem validar permissao no servidor.
- UI nao substitui seguranca server-side ou RLS.
- PTAX, markup cambial e fatores internos nao aparecem para o cliente.
- Economia e sempre estimativa, nunca garantia.
- NCM sugerido e sempre preliminar ate validacao fiscal.
- Atualizar `state.md` ao concluir entrega relevante.

## Proximos Passos Recomendados

1. Refinar os CRUDs de Cotacoes, Usuarios e Simulacoes usando o padrao de Clientes.
2. Consolidar Storage real para imagens/anexos e policies.
3. Criar parametros administrativos versionados.
4. Validar RLS com admin e clientes diferentes.
5. Criar CI com lint, typecheck e build.

## Arquivos Mais Importantes

- `agents.md`
- `state.md`
- `docs/spec-cruds.md`
- `docs/especificacao-calculadora.md`
- `docs/DATABASE_MODEL.md`
- `docs/AUTH_AND_PERMISSIONS.md`
- `src/lib/auth/get-session-profile.ts`
- `src/lib/actions/client-quotes.ts`
- `src/lib/client/quotes.ts`
- `src/lib/actions/admin.ts`
- `src/lib/admin/queries.ts`
- `src/components/calculator/CalculatorClient.tsx`
- `src/components/admin/ClientForm.tsx`
- `supabase/migrations/`
