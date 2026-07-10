# Ambientes Supabase

Este projeto usa Dev como ambiente padrao para desenvolvimento local e validacao de migrations.

Runbook completo de deploy, Vercel Production, smoke test e operacao segura: `docs/DEPLOYMENT.md`.

Checklist de onboarding para devs e maquinas novas: `docs/DEV_ONBOARDING.md`.

## Arquivos locais

- `.env.local`: usado pelo app Next.js local. Deve apontar para o Supabase Dev durante desenvolvimento.
- `.env.supabase.dev`: usado pelos scripts do Supabase CLI para linkar e aplicar migrations no Dev.
- `.env.supabase.prod`: usado pelos scripts do Supabase CLI para operacoes em Producao.

`.env.supabase.dev` e `.env.supabase.prod` sao arquivos locais, ignorados pelo Git, e nunca devem ser commitados.

Os arquivos versionados sao:

- `.env.supabase.dev.example`
- `.env.supabase.prod.example`

Use os `.example` como referencia e preencha os arquivos reais localmente.

## Projetos

Dev:

```text
SUPABASE_PROJECT_REF=neomzmuaocniunjyvpsk
SUPABASE_PROJECT_URL=https://neomzmuaocniunjyvpsk.supabase.co
```

Producao:

```text
SUPABASE_PROJECT_REF=wrcgjooqbgxnjztuzfpo
SUPABASE_PROJECT_URL=https://wrcgjooqbgxnjztuzfpo.supabase.co
```

## Fluxo seguro

Dev e o padrao. Para migrations em Dev:

```bash
scripts/supabase-db-dry-run-dev.sh
scripts/supabase-db-push-dev.sh
```

Producao exige dry-run antes:

```bash
scripts/supabase-db-dry-run-prod.sh
```

Push real em Producao exige confirmacao explicita por variavel de ambiente:

```bash
CONFIRM_PROD_DB_PUSH=YES scripts/supabase-db-push-prod.sh
```

Depois de qualquer operacao em Producao, os scripts tentam voltar automaticamente o link do Supabase CLI para Dev.

## Vercel

Vercel Production continua usando variaveis de Producao configuradas no painel da Vercel.
Vercel Production deve permanecer apontando para Supabase Prod. Depois de operar em Producao, volta-se o link do Supabase CLI para Dev; a Vercel Production nao deve voltar para Dev.

Variavel critica em Production:

```text
NEXT_PUBLIC_SUPABASE_URL=https://wrcgjooqbgxnjztuzfpo.supabase.co
```

Nao imprimir keys/secrets e nao versionar arquivos `.env` reais.
