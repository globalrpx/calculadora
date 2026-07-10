# Onboarding de Desenvolvedor

Data de referencia: 2026-07-10

## Objetivo

Este guia ajuda um desenvolvedor a sair do zero ate rodar a plataforma Global RPX localmente com seguranca, usando Supabase Dev por padrao e evitando confusao com Producao.

Bloco copy-paste para iniciar uma sessao com Codex:

```txt
Codex, leia docs/DEV_ONBOARDING.md, AGENTS.md, state.md e docs/DEPLOYMENT.md.
Depois me ajude a fazer o projeto rodar nesta máquina da maneira correta.
Antes de alterar qualquer arquivo, me informe:
- branch atual
- git status
- versão do Node/npm
- se as dependências estão instaladas
- se os arquivos .env necessários existem
- se o Supabase CLI está instalado
- qual projeto Supabase está linkado
- quais comandos devo rodar para validar
- quais riscos existem antes de mexer em banco ou produção
Não altere código, não rode migrations e não faça deploy sem minha aprovação explícita.
```

## Acessos Necessarios

O dev precisa receber:

- acesso ao GitHub: `https://github.com/globalrpx/calculadora`;
- acesso ao Supabase Dev;
- acesso ao Supabase Prod somente se for operar producao;
- acesso a Vercel somente se for deployar;
- arquivos env reais enviados separadamente pelo Hugo.

## Pre-requisitos Locais

Checklist:

- Git instalado;
- Node/npm instalados;
- Supabase CLI instalado;
- Vercel CLI instalado, se for mexer com deploy;
- acesso ao terminal;
- editor de codigo;
- navegador.

Comandos de verificacao:

```bash
git --version
node --version
npm --version
supabase --version
vercel --version
```

## Clonar Projeto

```bash
git clone https://github.com/globalrpx/calculadora.git
cd calculadora
npm install
```

Depois de clonar, leia:

- `AGENTS.md`;
- `state.md`;
- `docs/DEPLOYMENT.md`;
- este arquivo.

## Arquivos de Ambiente

Arquivos locais esperados:

- `.env.local`: usado pelo app Next.js local; deve apontar para Supabase Dev.
- `.env.supabase.dev`: usado pelos scripts Dev do Supabase CLI.
- `.env.supabase.prod`: usado pelos scripts Prod do Supabase CLI.

Regras:

- arquivos reais serao enviados separadamente;
- nunca commitar env real;
- `.env.*.example` pode ser versionado;
- so configurar `.env.supabase.prod` se tiver autorizacao para operacoes de producao.

Checklist:

- receber `.env.local`;
- receber `.env.supabase.dev`;
- configurar `.env.supabase.prod` somente se houver autorizacao para producao.

## Supabase Dev

Dev e o ambiente padrao.

```text
Supabase Dev ref: neomzmuaocniunjyvpsk
```

Para linkar o CLI no Dev:

```bash
scripts/supabase-link-dev.sh
```

Para conferir o projeto linkado:

```bash
cat supabase/.temp/project-ref
```

Resultado esperado:

```text
neomzmuaocniunjyvpsk
```

Nao rodar scripts de Producao sem autorizacao explicita.

## Rodar Projeto Local

Scripts reais do projeto:

- desenvolvimento local: `npm run dev`;
- build: `npm run build`;
- lint: `npm run lint`;
- typecheck: `npm run typecheck`;
- start de build local: `npm run start`.

Validacao antes de trabalhar:

```bash
npm run typecheck
npm run lint
npm run build
```

Rodar localmente:

```bash
npm run dev
```

URL local esperada:

```text
http://localhost:3000
```

Se a porta `3000` estiver ocupada, o Next.js pode subir em outra porta, como `3001`, `3002` ou `3003`.

## Login e Usuarios de Teste Dev

Usuarios de teste conhecidos no Supabase Dev:

- admin: `admin-dev@globalrpx.com`;
- cliente: `cliente1@globalrpx.com`.

Nao colocar senhas reais neste documento.

Regras:

- senhas serao enviadas separadamente;
- senhas fracas usadas em teste devem ser trocadas depois;
- nao copiar senha para commit, issue, log ou documentacao.

## Smoke Test Local

Checklist minimo:

- Home abre.
- `/login` abre.
- Login admin Dev funciona.
- `/admin` abre.
- `/admin/clientes` abre.
- `/admin/simulacoes-finais` abre.
- `/admin/cadastros/tipos-despesa` abre.
- `/admin/cadastros/pre-calculos-despesas` abre.
- `/admin/cadastros/parametrizacoes-fiscais` abre.
- Cotacao comum salva com fornecedor opcional.

Se algum passo falhar, registre:

- rota;
- mensagem exata;
- usuario usado;
- ambiente Supabase linkado;
- se `.env.local` aponta para Dev.

## Como Trabalhar com Codex

Antes de qualquer tarefa, peca ao Codex para ler:

- `AGENTS.md`;
- `state.md`;
- `docs/DEPLOYMENT.md`;
- `docs/DEV_ONBOARDING.md`;
- `docs/FINAL_SIMULATIONS_V1_CLOSEOUT.md`, se for mexer em Simulacoes Finais;
- `docs/FINAL_SIMULATION_OUTPUT_MAPPING.md`, se for mexer em PDF/relatorios;
- `docs/DATABASE_MODEL.md`, se for mexer em banco.

Prompt curto para iniciar:

```txt
Codex, leia docs/DEV_ONBOARDING.md, AGENTS.md, state.md e docs/DEPLOYMENT.md. Não altere nada ainda. Primeiro me diga o estado do ambiente, o que falta configurar e o passo a passo seguro para rodar o projeto localmente.
```

## Regras de Trabalho

- Uma tarefa por commit.
- Nao misturar layout, banco e calculo no mesmo checkpoint.
- Sempre rodar `git diff --check`.
- Sempre rodar `npm run typecheck`.
- Sempre rodar `npm run lint`.
- Nao commitar sem validacao.
- Nao commitar `.env`.
- Nao imprimir secrets.
- Nao usar `profiles` como fonte de permissao.
- Usar `app_users` como fonte de roles/status.
- Nao mexer em Producao sem dry-run e aprovacao.
- Nao usar `uploads` para `final_simulations` ate existir vinculo correto.
- Antes de alterar migrations, confirmar ambiente e risco.
- Antes de deploy, seguir `docs/DEPLOYMENT.md`.

## Producao

Runbook completo: `docs/DEPLOYMENT.md`.

Resumo:

- Supabase Producao: `wrcgjooqbgxnjztuzfpo`.
- Vercel Production sempre aponta para Supabase Prod.
- Supabase CLI volta para Dev depois de operacao Prod.
- Nao gerar dados reais de teste em producao sem autorizacao.
- Nao criar admin Prod, rodar migration Prod ou fazer deploy sem aprovacao explicita.

## Estado Atual do Projeto

- App publicado em `https://calculadora.globalrpx.com.br`.
- Supabase Prod com migrations aplicadas.
- GitHub `main` atualizado ate `923c9a8`.
- Simulacoes Finais V1 fechada no Dev e publicada.
- Smoke publico online passou.
- Smoke autenticado Prod ainda depende de admin/credencial Prod.

## Pendencias Conhecidas

- Criar ou validar admin Prod.
- Executar smoke autenticado em producao.
- Refinar PDF/relatorio com Rodrigo.
- Validar formula fiscal avancada.
- Modelar campos complementares do PDF.
- Avaliar Excel interno futuro.

## Checklist Antes de Pedir Ajuda

Antes de pedir uma correcao ao Codex, colete:

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
node --version
npm --version
supabase --version
cat supabase/.temp/project-ref
```

Nao cole secrets, tokens, anon keys, service role keys ou senhas na conversa.
