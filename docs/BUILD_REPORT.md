# Global RPX - Relatorio de Build

Data: 12 de junho de 2026.

## Objetivo

Estabilizar o projeto Next.js sem alterar arquitetura, escopo de produto, banco ou regras da calculadora.

## Ambiente utilizado

- Arquitetura: Next.js 15 com App Router.
- Node disponivel no ambiente: `v24.14.0`.
- npm global: indisponivel no PATH.
- npm temporario usado para a estabilizacao: `11.4.2`, extraido em `/tmp`.
- Supabase real: nao configurado.
- Modo usado no build: auth mock, pois as variaveis Supabase estao vazias.

O npm temporario foi usado apenas como ferramenta. As dependencias foram instaladas normalmente em `node_modules` e o lockfile foi salvo em `package-lock.json`.

## Dependencias instaladas

Foram instalados 424 pacotes. Dependencias diretas resolvidas:

| Pacote | Versao instalada |
|---|---:|
| `next` | `15.5.19` |
| `react` | `19.2.7` |
| `react-dom` | `19.2.7` |
| `@supabase/ssr` | `0.6.1` |
| `@supabase/supabase-js` | `2.108.1` |
| `clsx` | `2.1.1` |
| `typescript` | `5.9.3` |
| `tailwindcss` | `3.4.19` |
| `eslint` | `9.39.4` |
| `eslint-config-next` | `15.5.19` |
| `postcss` | `8.5.15` |
| `autoprefixer` | `10.5.0` |

O `package.json` nao foi atualizado para fixar essas versoes exatas; o `package-lock.json` lockfile v3 garante a reproducao da instalacao.

## Comandos executados

Bootstrap do npm temporario:

```bash
curl -L https://registry.npmjs.org/npm/-/npm-11.4.2.tgz -o /tmp/npm-11.4.2.tgz
mkdir -p /tmp/npm-11.4.2
tar -xzf /tmp/npm-11.4.2.tgz -C /tmp/npm-11.4.2
node /tmp/npm-11.4.2/package/bin/npm-cli.js --version
```

Instalacao:

```bash
node /tmp/npm-11.4.2/package/bin/npm-cli.js install
PATH=<node-bin>:$PATH node /tmp/npm-11.4.2/package/bin/npm-cli.js install
```

Validacoes:

```bash
npm run lint
npm run typecheck
npm run build
npm run start -- -p 3003
npm ls --depth=0
npm audit --json
```

Neste ambiente, os comandos npm foram executados chamando o CLI temporario por caminho absoluto.

## Erros encontrados

### 1. Node ausente no PATH dos scripts de instalacao

Primeira tentativa:

```text
npm error command sh -c node postinstall.js
npm error sh: node: command not found
```

Causa: havia um executavel Node disponivel, mas seu diretorio nao estava no PATH dos scripts `postinstall`.

Correcao: repetir `npm install` com o diretorio do Node adicionado ao PATH.

Resultado: 424 pacotes instalados e auditados.

### 2. Tipos implicitos nos adaptadores de cookie do Supabase

O typecheck encontrou erros `TS7006` e `TS7031` em:

- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`

Os parametros de `setAll(cookiesToSet)` e suas propriedades eram inferidos como `any`.

Correcao:

- Importado o tipo oficial `SetAllCookies` de `@supabase/ssr`.
- Anotado o parametro como `Parameters<SetAllCookies>[0]`.

Nenhuma regra de auth ou comportamento foi alterado.

### 3. Aviso de depreciacao do lint

`npm run lint` passou sem erros, mas o Next informou que `next lint` sera removido no Next 16.

Como o projeto permanece em Next 15 nesta etapa, o script foi mantido. Antes de migrar para Next 16, trocar para ESLint CLI e adotar a configuracao correspondente.

### 4. Vulnerabilidades moderadas

`npm audit` reportou:

- 2 moderadas.
- 0 altas.
- 0 criticas.

Origem:

- `postcss < 8.5.10` empacotado dentro de `next`.
- Advisory `GHSA-qx2v-qp2m-jg93`.

O npm sugeriu um downgrade de Next para `9.3.3`, que e incompatível com a arquitetura atual. Nao foi executado `npm audit fix --force`.

## Resultado dos comandos

| Comando | Resultado |
|---|---|
| `npm install` | Sucesso apos ajuste de PATH |
| `npm run lint` | Sucesso, sem warnings/erros de codigo; aviso de depreciacao do comando |
| `npm run typecheck` inicial | Falhou por tipos de cookies |
| `npm run typecheck` final | Sucesso |
| `npm run build` inicial | Falhou pelo mesmo erro de tipos |
| `npm run build` final | Sucesso |
| `npm run start -- -p 3003` | Sucesso; servidor pronto em 199 ms |
| `npm ls --depth=0` | Sucesso |
| `npm audit --json` | 2 vulnerabilidades moderadas conhecidas |

## Status final do build

**APROVADO.**

O build de producao:

- Compilou com sucesso.
- Validou lint e tipos.
- Gerou 17 paginas/rotas.
- Incluiu `/api/exchange-rate`.
- Manteve rotas dinamicas de cliente e admin.

Validacao HTTP do artefato executado:

- `/`: HTTP 200.
- `/login`: HTTP 200.
- `/app` sem sessao: HTTP 307 para `/login`.
- `/api/exchange-rate`: HTTP 200, `Cache-Control: no-store` e resposta PTAX valida.

Tamanho observado:

- JavaScript compartilhado inicial: aproximadamente `102 kB`.
- Pagina da calculadora: aproximadamente `5.11 kB`, com `111 kB` de First Load JS.

## Arquivos alterados

- `package-lock.json`: criado.
- `src/lib/supabase/middleware.ts`: tipo do callback de cookies.
- `src/lib/supabase/server.ts`: tipo do callback de cookies.
- Documentacao de status e contexto.

Nao foram alterados:

- Arquitetura Next.js.
- App Router.
- Middleware.
- Preview temporario.
- Migration Supabase.
- Regras ou interface da calculadora.

## Proximos problemas tecnicos

1. Instalar Node/npm de forma convencional na maquina de desenvolvimento para comandos mais simples.
2. Definir uma versao Node suportada para equipe e Vercel, preferencialmente Node 20 ou 22 LTS.
3. Acompanhar atualizacoes do Next 15 que eliminem o PostCSS vulneravel sem downgrade.
4. Migrar `next lint` para ESLint CLI antes do Next 16.
5. Adicionar testes automatizados de formulas, auth mock e middleware.
6. Criar CI para `npm ci`, lint, typecheck e build.
7. Validar o build novamente quando as variaveis reais do Supabase forem introduzidas.
