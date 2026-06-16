# Contexto para Continuacao por Outra IA

## Leia primeiro

1. `agents.md`
2. `state.md`
3. `docs/AI_CONTEXT.md`
4. O documento especifico da tarefa.

## Contexto do negocio

A Global RPX atua com importacao e apoio a clientes que pesquisam produtos, fornecedores e custos. A plataforma deve substituir informacoes dispersas em cadernos, planilhas e conversas por um fluxo simples de cotacao preliminar, validacao da equipe Brasil e simulacao publicada.

Nao transformar o produto em ERP completo no MVP.

## Objetivo do app

- Cliente registra produto e fornecedor.
- Sistema calcula uma estimativa preliminar.
- Cliente salva e acompanha o historico.
- Equipe RPX valida NCM, custos e viabilidade.
- Admin cria uma simulacao mais detalhada.
- Cliente consulta o resultado publicado.

## Arquitetura atual

O projeto e **Next.js 15 com App Router**, React 19, TypeScript e Tailwind. Nao e Vite.

- Rotas: `src/app`.
- Componentes: `src/components`.
- Regras e integracoes: `src/lib`.
- Supabase: Auth/Postgres/Storage planejados.
- Deploy alvo: Vercel.
- Middleware protege `/app` e `/admin`.
- Sem envs do Supabase, usa auth mock por cookie.
- Calculadora usa localStorage separado por e-mail.
- Preview temporario: `scripts/preview-server.mjs`, porta 3002.
- Dependencias instaladas e travadas em `package-lock.json`.
- Lint, typecheck e `next build` aprovados em 12 de junho de 2026.

## Usuarios e rotas

Usuarios mock:

- `cliente1@gmail.com`
- `cliente2@gmail.com`
- `admin@globalrpx.com`

Cliente:

- `/app`
- `/app/calculadora`
- `/app/simulacoes`

Admin:

- `/admin/dashboard`
- `/admin/clientes`
- `/admin/fornecedores`
- `/admin/despachantes`
- `/admin/usuarios`
- `/admin/parametros`
- `/admin/cotacoes`
- `/admin/simulacoes`

## Decisoes tecnicas e de produto

- Dados de negocio devem ter `client_id` e RLS.
- `SUPABASE_SERVICE_ROLE_KEY` nunca vai para o client.
- Fator RPX padrao interno: `1.8`.
- Fator de importacao direta interno: `2.2`.
- PTAX venda e consultada em tempo de execucao.
- Taxa interna atual: `PTAX x 1.03`.
- PTAX, markup e fatores nao aparecem ao cliente.
- Quantidade inicial: `1000`.
- NCM e sempre preliminar ate validacao fiscal.
- Fornecedor exige nome+e-mail+telefone ou foto do cartao/contato.
- OCR fica para fase futura.
- Resultado e estimativa, nunca garantia.

## Calculadora atual

Arquivo principal:

```text
src/components/calculator/CalculatorClient.tsx
```

Possui:

- Formulario de produto e fornecedor.
- Autocomplete de NCM usando `public/data/ncm.json`.
- Upload visual/mock.
- Consulta de cambio em `/api/exchange-rate`.
- Calculo em `src/lib/calculator/calculate-quote.ts`.
- Fluxo em sanfona: formulario -> resultado -> refazer.
- Historico em `global-rpx-quotes:{email}` no localStorage.

O componente esta grande e deve ser dividido gradualmente.

## Supabase atual

`supabase/migrations/001_foundation.sql` cria apenas:

- `clients`
- `profiles`
- `is_admin()`
- RLS inicial de leitura.

Ainda faltam cotacoes, calculos, fornecedores, anexos, parametros, status e simulacoes. O modelo proposto esta em `docs/DATABASE_MODEL.md`.

## Status atual

Pronto/parcial:

- Fundacao visual.
- Home e login.
- Auth mock e estrutura Supabase.
- Layouts cliente/admin.
- Calculadora mock funcional.
- NCM local.
- PTAX server-side.
- Build de producao validado.
- Lockfile gerado.

Pendente:

- Supabase real.
- Persistencia e Storage.
- Admin funcional.
- Simulacoes.
- Testes.
- Vercel.
- Testes automatizados e CI.
- Migracao futura de `next lint` para ESLint CLI.

## Proximos passos recomendados

1. Definir Node 20 ou 22 LTS para desenvolvimento e Vercel.
2. Criar CI com `npm ci`, lint, typecheck e build.
3. Configurar Supabase dev.
4. Criar migrations de cotacoes/calculos/anexos/parametros.
5. Testar RLS com dois clientes.
6. Criar Server Action transacional para calcular e salvar.
7. Migrar imagens para Storage privado.
8. Criar historico e detalhe persistidos.
9. Criar admin de cotacoes e validacao Brasil.
10. Fazer deploy Preview na Vercel.

## Principais cuidados

- Nao documentar ou tratar o projeto como Vite.
- Nao expor parametros internos em payloads, UI ou textos copiados.
- Nao confiar em `client_id` vindo do browser.
- Nao remover mudancas existentes sem pedido.
- Atualizar `state.md` ao concluir cada entrega.
- Manter preview e Next alinhados enquanto o preview existir.
- Depois que Next estiver operacional, remover a duplicacao do preview.
- O audit atual possui duas vulnerabilidades moderadas no PostCSS interno do Next; nao usar downgrade ou `audit fix --force`.

## Arquivos mais importantes

- `agents.md`
- `state.md`
- `docs/CURRENT_STATUS.md`
- `docs/BUILD_REPORT.md`
- `docs/DATABASE_MODEL.md`
- `docs/API_AND_SUPABASE_PLAN.md`
- `src/components/calculator/CalculatorClient.tsx`
- `src/lib/calculator/calculate-quote.ts`
- `src/lib/exchange-rate/get-ptax.ts`
- `src/lib/auth/get-session-profile.ts`
- `src/lib/supabase/middleware.ts`
- `supabase/migrations/001_foundation.sql`
- `scripts/preview-server.mjs`
