# Global RPX Platform

Plataforma web para cotacoes preliminares de importacao, registro de produtos e fornecedores, simulacoes e relacionamento entre clientes e a equipe Global RPX.

> O projeto usa **Next.js 15 com App Router**, nao Vite.

## Estado Atual

Resumo em 18 de junho de 2026:

- Supabase real configurado e autenticacao real funcionando.
- `app_users` e a fonte de verdade da aplicacao para usuario, role, status e vinculo com cliente.
- Home, cadastro publico, login, conta, area do cliente e area administrativa existem.
- Calculadora persiste cotacoes reais em `quotes`.
- Historico da calculadora carrega dados reais do Supabase.
- Solicitacao de simulacao completa cria registros reais em `simulations`.
- Dashboard do cliente e dashboard admin usam dados dinamicos.
- Admin de Clientes possui CRUD completo com filtros, paginacao, ordenacao, validacao inline e soft delete/inativacao.
- Modo mock e `scripts/preview-server.mjs` continuam como fallback/apoio, nao como fluxo principal.

Para o estado vivo e mais granular, consulte [state.md](state.md). Para regras de trabalho de agentes/desenvolvedores, consulte [agents.md](agents.md).

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres e Storage preparado para anexos futuros
- Vercel
- API PTAX do Banco Central

## Requisitos

- Node.js 20 LTS ou superior.
- npm, pnpm ou yarn.
- Projeto Supabase com as migrations do repositorio aplicadas.

## Instalacao

```bash
npm install
cp .env.example .env.local
```

Configure `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Sem URL e anon key publicas, a aplicacao usa o modo mock por cookie como fallback local.

## Como Rodar

```bash
npm run dev
```

Acesse `http://localhost:3000`, salvo porta diferente informada pelo Next.

Scripts principais:

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

Observacao: `next lint` ainda e o script atual do projeto, mas esta depreciado no caminho para o Next 16.

## Supabase

As migrations atuais cobrem a fundacao de auth/perfis, `app_users`, base administrativa, `quotes`, `simulations`, soft delete e persistencia da calculadora.

Regras importantes:

- `app_users` e a fonte de verdade da aplicacao.
- `profiles` existe como legado/fundacao inicial, mas nao deve guiar novas implementacoes.
- Dados de cliente devem respeitar isolamento por `client_id` e RLS.
- `SUPABASE_SERVICE_ROLE_KEY` nunca deve ir para codigo client.

## Preview Temporario

Quando o ambiente Next nao puder ser usado:

```bash
PORT=3002 node scripts/preview-server.mjs
```

O preview nao substitui a aplicacao real em `src/app` e deve ser tratado como ferramenta auxiliar.

## Estrutura Resumida

```text
src/app/              rotas Next.js, layouts e API
src/components/       layout, UI, admin, landing e calculadora
src/lib/              actions, auth, Supabase, queries, calculos e helpers
supabase/migrations/  migrations SQL versionadas
public/data/          dataset NCM servido ao app
scripts/              normalizacao NCM e preview temporario
docs/                 documentacao de produto e tecnica
state.md              memoria viva do projeto
agents.md             regras para agentes/desenvolvedores
```

## Documentacao

- [Status atual](docs/CURRENT_STATUS.md)
- [Contexto para IA/dev](docs/AI_CONTEXT.md)
- [Visao do projeto](docs/PROJECT_OVERVIEW.md)
- [Stack tecnica](docs/TECH_STACK.md)
- [Estrutura de pastas](docs/FOLDER_STRUCTURE.md)
- [Rotas e telas](docs/ROUTES_AND_SCREENS.md)
- [Modelo de banco](docs/DATABASE_MODEL.md)
- [Auth e permissoes](docs/AUTH_AND_PERMISSIONS.md)
- [Spec de CRUDs administrativos](docs/spec-cruds.md)
- [Especificacao da calculadora](docs/especificacao-calculadora.md)
- [Plano de API e Supabase](docs/API_AND_SUPABASE_PLAN.md)
- [Guia de UI/UX](docs/UI_UX_GUIDE.md)
- [Backlog](docs/FEATURES_BACKLOG.md)

## Proximos Passos

1. Refinar os CRUDs administrativos de Cotacoes, Usuarios e Simulacoes seguindo `docs/spec-cruds.md`.
2. Evoluir Storage real para anexos/imagens e policies correspondentes.
3. Implementar parametros administrativos versionados para fatores e markup cambial.
4. Criar CI com lint, typecheck e build.
5. Validar RLS com cenarios admin, cliente 1 e cliente 2 antes de producao.
