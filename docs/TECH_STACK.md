# Global RPX - Stack Tecnica

## Arquitetura atual

O projeto e uma aplicacao **Next.js**, e nao React + Vite.

| Tecnologia | Versao declarada | Uso |
|---|---:|---|
| Next.js | `^15.3.2` | App Router, rotas, Server Components, middleware e API |
| React | `^19.0.0` | Interface |
| React DOM | `^19.0.0` | Renderizacao |
| TypeScript | `^5.8.3` | Tipagem |
| Tailwind CSS | `^3.4.17` | Estilos |
| Supabase JS | `^2.49.4` | Auth, banco e Storage futuros |
| Supabase SSR | `^0.6.1` | Sessao no servidor e middleware |
| clsx | `^2.1.1` | Classes condicionais |
| ESLint | `^9.25.1` | Analise estatica |

Nao existe dependencia de Vite nem script `vite` no `package.json`.

## Bibliotecas instaladas/declaradas

Dependencias de execucao:

- `next`
- `react`
- `react-dom`
- `@supabase/supabase-js`
- `@supabase/ssr`
- `clsx`

Dependencias de desenvolvimento:

- `typescript`
- `eslint`
- `eslint-config-next`
- `tailwindcss`
- `postcss`
- `autoprefixer`
- Tipos de Node, React e React DOM.

O repositorio possui `package-lock.json` v3 e dependencias instaladas. O build validado resolveu Next `15.5.19`, React `19.2.7` e TypeScript `5.9.3`.

## Estrutura de build

- Codigo-fonte: `src/`.
- Rotas: `src/app/`.
- Build: `next build`.
- Execucao de producao: `next start`.
- Deploy: Vercel com framework `nextjs`, configurado em `vercel.json`.
- TypeScript usa alias `@/* -> ./src/*`.
- Tailwind examina `src/**/*.{js,ts,jsx,tsx,mdx}`.

## Como rodar localmente

Requisitos recomendados:

- Node.js 20 LTS ou superior.
- npm, pnpm ou yarn.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

Comandos:

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
```

Observacao: `next lint` passou no Next 15.5.19, mas esta depreciado e deve migrar para ESLint CLI antes do Next 16.

## Preview temporario

`scripts/preview-server.mjs` replica parte da aplicacao sem executar Next.js:

```bash
PORT=3002 node scripts/preview-server.mjs
```

Esse preview serve apenas para demonstracao local. Ele duplica HTML, CSS, auth mock e calculadora, portanto nao deve ser tratado como aplicacao de producao.

## Variaveis de ambiente

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Regras:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave publica usada com RLS.
- `SUPABASE_SERVICE_ROLE_KEY`: somente em codigo server-side administrativo; nunca enviar ao browser.
- Sem as duas variaveis publicas, o sistema ativa o login mock por cookie.

Recomendacao futura:

```text
SUPABASE_SERVICE_ROLE_KEY=
PTAX_INTERNAL_MARKUP_PERCENT=3
DEFAULT_RPX_FACTOR=1.8
DEFAULT_DIRECT_IMPORT_FACTOR=2.2
```

Parametros comerciais devem preferencialmente ficar no banco, auditados, em vez de variaveis de ambiente.

## Publicacao na Vercel

1. Criar projeto Supabase.
2. Executar as migrations.
3. Configurar Auth e usuarios iniciais.
4. Importar o repositorio na Vercel.
5. Manter Framework Preset como Next.js.
6. Configurar as variaveis em Development, Preview e Production.
7. Executar o primeiro deploy.
8. Validar login, middleware, PTAX e RLS no dominio da Vercel.

Nao e necessario definir comando customizado: a Vercel detecta `next build`.

## Supabase atual e futuro

Atual:

- Clientes browser e server preparados.
- Middleware de sessao preparado.
- Auth por e-mail/senha preparado.
- Migration com `clients`, `profiles` e RLS inicial.

Futuro:

- Cotacoes, itens, calculos e snapshots de parametros.
- Fornecedores e contatos.
- Imagens no Supabase Storage.
- NCM, impostos e validacoes.
- Simulacoes e historico de versoes.
- Auditoria de alteracoes administrativas.

## Integracao externa atual

A rota `GET /api/exchange-rate` consulta a PTAX venda no Banco Central em tempo de execucao, sem cache, e devolve uma taxa interna ajustada. O cliente nao deve receber detalhes da composicao comercial dessa taxa.
