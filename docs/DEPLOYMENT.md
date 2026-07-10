# Deploy e Operacao de Ambientes

Data de referencia: 2026-07-10

Este documento registra o processo operacional real de deploy da plataforma Global RPX e serve como runbook para proximas publicacoes. Ele existe para evitar confusao entre Supabase Dev, Supabase Producao, Vercel Production, GitHub e arquivos `.env` locais.

## Visao Geral dos Ambientes

### Dev

- Supabase Dev ref: `neomzmuaocniunjyvpsk`.
- Uso: desenvolvimento local, testes funcionais e validacao de migrations antes de producao.
- `.env.local` deve apontar para Supabase Dev durante o desenvolvimento.
- Supabase CLI deve ficar linkado no Dev por padrao.

### Producao

- Supabase Prod ref: `wrcgjooqbgxnjztuzfpo`.
- Uso: aplicacao online em producao.
- Vercel Production deve apontar sempre para Supabase Prod.
- Vercel Production nunca deve apontar para Supabase Dev.

## Regra Operacional Principal

Depois de mexer em producao, o que volta para Dev e:

- o link do Supabase CLI;
- o ambiente local de desenvolvimento;
- os arquivos locais, como `.env.local`, que podem continuar apontando para Dev.

A Vercel Production nao volta para Dev.

Production da Vercel deve permanecer apontando para Supabase Prod:

```text
https://wrcgjooqbgxnjztuzfpo.supabase.co
```

## Ordem Oficial de Deploy

Checklist padrao:

1. Garantir Git limpo.
2. Validar localmente:

```bash
npm run typecheck
npm run lint
npm run build
```

3. Fazer push da branch `main` para o GitHub.
4. Aplicar migrations no Supabase Prod:

```bash
scripts/supabase-link-prod.sh
scripts/supabase-db-dry-run-prod.sh
```

5. Revisar exatamente as migrations listadas no dry-run.
6. Se estiver correto, aplicar em Producao:

```bash
CONFIRM_PROD_DB_PUSH=YES scripts/supabase-db-push-prod.sh
```

7. Validar banco de Producao.
8. Voltar o CLI para Dev:

```bash
scripts/supabase-link-dev.sh
```

9. Confirmar envs da Vercel Production.
10. Confirmar que `NEXT_PUBLIC_SUPABASE_URL` aponta para Supabase Prod.
11. Fazer deploy:

```bash
vercel --prod
```

12. Executar smoke test online.

## Variaveis Vercel Production

Variaveis esperadas em Production:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Valor esperado de `NEXT_PUBLIC_SUPABASE_URL` em Production:

```text
https://wrcgjooqbgxnjztuzfpo.supabase.co
```

Regras:

- Nao imprimir `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Nao imprimir `SUPABASE_SERVICE_ROLE_KEY`.
- Nao versionar env real.
- Vercel pode marcar envs como `sensitive`; nesse caso a validacao direta via CLI pode nao exibir os valores. Confirmar pelo comando de update, metadado `updatedAt` e smoke test.

## Arquivos Env Locais

- `.env.local`: arquivo local do app Next.js. Deve apontar para Dev durante desenvolvimento.
- `.env.supabase.dev`: arquivo local usado pelos scripts Supabase Dev.
- `.env.supabase.prod`: arquivo local usado pelos scripts Supabase Prod.

Arquivos reais com secrets devem ficar ignorados pelo Git.

Arquivos versionaveis:

- `.env.example`
- `.env.supabase.dev.example`
- `.env.supabase.prod.example`

Rodrigo/devs devem receber arquivos reais separadamente, nunca via commit.

## Scripts Supabase

Scripts disponiveis:

- `scripts/supabase-link-dev.sh`: linka o CLI ao Supabase Dev.
- `scripts/supabase-link-prod.sh`: linka o CLI ao Supabase Prod.
- `scripts/supabase-db-dry-run-dev.sh`: simula migrations contra Dev.
- `scripts/supabase-db-dry-run-prod.sh`: simula migrations contra Prod.
- `scripts/supabase-db-push-dev.sh`: aplica migrations no Dev.
- `scripts/supabase-db-push-prod.sh`: aplica migrations no Prod.

Regras:

- Producao exige dry-run antes.
- Producao exige `CONFIRM_PROD_DB_PUSH=YES`.
- Nao contornar a protecao do script.
- Depois de operar em Prod, relinkar Dev.
- Nunca rodar reset de banco em Producao.

## Smoke Test Production

Checklist minimo:

- Home abre.
- `/cadastro` carrega.
- `/login` carrega.
- Rotas admin protegidas redirecionam para `/login` sem erro 500.
- Login admin funciona, se admin Prod existir.
- `/admin/clientes` carrega.
- `/admin/clientes` mostra coluna `Tipo`.
- `/admin/clientes` mostra filtro `Tipo de cliente`.
- `/admin/simulacoes-finais` carrega.
- `/admin/cadastros/tipos-despesa` carrega.
- `/admin/cadastros/pre-calculos-despesas` carrega.
- `/admin/cadastros/parametrizacoes-fiscais` carrega.

Nao fazer em smoke test sem aprovacao explicita:

- criar simulacao real;
- gerar PDF real;
- criar dados de teste sem prefixo claro;
- alterar cadastros reais;
- rodar scripts Supabase.

## Deploy Executado Nesta Rodada

GitHub:

- Push para `main` concluido.
- Hash: `1811e8b`.

Supabase Prod:

- Projeto: `wrcgjooqbgxnjztuzfpo`.
- Migrations aplicadas:
  - `20260709200000_create_final_simulations_core.sql`;
  - `20260709213000_create_expense_types_and_presets.sql`;
  - `20260710120000_create_invoice_parametrizations.sql`;
  - `20260710193000_add_client_type_to_clients.sql`.
- Supabase CLI voltou para Dev: `neomzmuaocniunjyvpsk`.

Vercel Production:

- Env corrigida: `NEXT_PUBLIC_SUPABASE_URL` apontando para Supabase Prod.
- Deployment: `dpl_9dcokaLRrqeNf8BPGEPrWbqT46Yx`.
- URL: `https://calculadora-k6gmtpui8-global-rpx-s-projects.vercel.app`.
- Dominio production: `https://calculadora.globalrpx.com.br`.
- Status: `Ready`.

Smoke test basico:

- Home respondeu HTTP 200.
- `/cadastro` carregou.
- `/login` carregou.
- Rotas admin protegidas redirecionaram para `/login` sem 500.

Pendencias:

- Smoke test autenticado admin em Prod ainda nao executado por falta de admin/credencial Prod fornecido.
- Nenhum dado de teste foi criado em Prod.

## Erros Comuns

- Vercel Production apontar para Supabase Dev ou projeto errado.
- Supabase CLI ficar linkado no Prod apos uma migration.
- Rodar migration Prod antes do GitHub estar atualizado.
- Commitar `.env` real por acidente.
- Fazer deploy sem build local.
- Criar dados reais de teste em producao sem alinhar antes.
- Gerar PDF ou documentos reais em Prod durante smoke test sem aprovacao.

## Procedimento de Emergencia

Se um deploy quebrar:

1. Nao rodar migrations novas sem diagnostico.
2. Nao resetar banco.
3. Nao apagar dados de producao.
4. Verificar envs da Vercel Production.
5. Verificar o ultimo deployment na Vercel.
6. Conferir logs do deployment e runtime.
7. Usar rollback da Vercel se necessario.
8. Validar novamente home, login e rotas protegidas.

## Checklist de Onboarding Rodrigo/Dev

1. Instalar Git.
2. Instalar Node em versao compativel com o projeto.
3. Clonar o repositorio.
4. Instalar dependencias.
5. Receber arquivos env reais separadamente.
6. Configurar `.env.local` apontando para Supabase Dev.
7. Configurar `.env.supabase.dev` e `.env.supabase.prod`.
8. Instalar e autenticar Supabase CLI.
9. Instalar e autenticar Vercel CLI.
10. Linkar Supabase Dev por padrao.
11. Rodar:

```bash
npm run typecheck
npm run lint
npm run build
```

12. Rodar o app local.
13. Nunca commitar `.env` real.
