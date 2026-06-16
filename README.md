# Global RPX Platform

Plataforma web para cotacoes preliminares de importacao, registro de produtos e fornecedores, simulacoes e relacionamento entre clientes e a equipe Global RPX.

> O projeto atual usa **Next.js 15 com App Router**, nao Vite.

## Tecnologias

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres e Storage
- Vercel
- API PTAX do Banco Central

## Estado atual

- Home, login e navegacao de cliente/admin.
- Auth mock por cookie e estrutura para Supabase Auth.
- Calculadora funcional com NCM, fornecedor, PTAX e comparativo.
- Historico temporario em localStorage por usuario.
- Painel administrativo ainda majoritariamente placeholder.
- Supabase real e deploy ainda pendentes.

Consulte [docs/CURRENT_STATUS.md](docs/CURRENT_STATUS.md) para o diagnostico completo.

## Requisitos

- Node.js 20 LTS ou superior.
- npm, pnpm ou yarn.
- Projeto Supabase para executar o modo real.

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

Sem URL e anon key, a aplicacao usa login mock.

## Como rodar

```bash
npm run dev
```

Acesse `http://localhost:3000`.

Outros comandos:

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

O lint, typecheck e build foram validados em 12 de junho de 2026. `next lint` esta depreciado e devera migrar para ESLint CLI antes do Next 16.

## Usuarios mock

- `cliente1@gmail.com`
- `cliente2@gmail.com`
- `admin@globalrpx.com`

No modo mock, qualquer um desses usuarios pode entrar pelo atalho da tela de login.

## Preview temporario

Quando o ambiente Next nao estiver disponivel:

```bash
PORT=3002 node scripts/preview-server.mjs
```

O preview nao substitui a aplicacao real e deve ser removido apos o fluxo Next estar publicado.

## Estrutura resumida

```text
src/app/             rotas Next.js e API
src/components/      layout, UI e calculadora
src/lib/             auth, Supabase, calculos e PTAX
supabase/migrations/ migrations SQL
public/data/          dataset NCM servido ao app
scripts/              normalizacao NCM e preview temporario
docs/                 documentacao de produto e tecnica
state.md              estado vivo do projeto
agents.md             instrucoes para novas sessoes
```

## Supabase

A migration atual cria apenas:

- `clients`
- `profiles`
- RLS inicial de leitura.

Execute `supabase/migrations/001_foundation.sql` no projeto de desenvolvimento. Antes do MVP, crie migrations adicionais conforme [docs/DATABASE_MODEL.md](docs/DATABASE_MODEL.md).

## Vercel

1. Importe o repositorio na Vercel.
2. Selecione o preset Next.js.
3. Configure as variaveis de ambiente.
4. Garanta que as migrations foram executadas.
5. Valide Auth, RLS e `/api/exchange-rate`.
6. Publique primeiro como Preview.

## Documentacao

- [Visao do projeto](docs/PROJECT_OVERVIEW.md)
- [Stack tecnica](docs/TECH_STACK.md)
- [Estrutura de pastas](docs/FOLDER_STRUCTURE.md)
- [Rotas e telas](docs/ROUTES_AND_SCREENS.md)
- [Modelo de banco](docs/DATABASE_MODEL.md)
- [Auth e permissoes](docs/AUTH_AND_PERMISSIONS.md)
- [Backlog](docs/FEATURES_BACKLOG.md)
- [Plano de API e Supabase](docs/API_AND_SUPABASE_PLAN.md)
- [Guia de UI/UX](docs/UI_UX_GUIDE.md)
- [Status atual](docs/CURRENT_STATUS.md)
- [Relatorio de build](docs/BUILD_REPORT.md)
- [Contexto para outra IA](docs/AI_CONTEXT.md)

## Proximos passos

1. Padronizar Node 20 ou 22 LTS e criar CI.
2. Configurar Supabase de desenvolvimento.
3. Implementar tabelas e RLS da calculadora.
4. Migrar localStorage e uploads para Supabase.
5. Implementar fluxo real de cotacoes no admin.
6. Publicar preview na Vercel.
