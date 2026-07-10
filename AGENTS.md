# Agents - Global RPX

Este arquivo orienta qualquer nova sessao/agente trabalhando na plataforma Global RPX.

## Antes de mexer no projeto

Leia, nesta ordem:

1. `state.md`
2. `docs/visao-geral-produto.md`
3. `docs/plano-fundacao-sistema.md`
4. `docs/especificacao-calculadora.md`, quando a tarefa envolver calculadora, cotacoes, historico ou imagens.
5. `docs/spec-cruds.md`, quando a tarefa envolver CRUDs administrativos, tabelas, filtros, formularios de cadastro/edicao ou exclusao.
6. O documento tematico correspondente, quando a tarefa envolver banco, auth, rotas, stack, UI/UX ou roadmap.

Depois de ler, confirme mentalmente:

- Qual fase esta ativa.
- O que ja foi entregue.
- O que ficou pendente.
- Qual arquivo ou modulo a tarefa deve alterar.

## Hierarquia da documentacao

Fontes da verdade por tema:

- `AGENTS.md`: regras operacionais para agentes/desenvolvedores.
- `state.md`: estado vivo e historico mais recente do projeto.
- `docs/spec-cruds.md`: padrao oficial de CRUDs administrativos.
- `docs/especificacao-calculadora.md`: padrao oficial da calculadora, cotacoes, historico, imagens e regras de calculo.
- `docs/DATABASE_MODEL.md`: modelo de dados, tabelas, campos, status e RLS.
- `docs/AUTH_AND_PERMISSIONS.md`: autenticacao, roles, `app_users`, permissoes e isolamento.
- `docs/ROUTES_AND_SCREENS.md`: rotas, telas e status das paginas.
- `docs/TECH_STACK.md`: stack, scripts, ambiente, Vercel e Supabase.
- `docs/DEPLOYMENT.md`: runbook operacional de deploy, Supabase Dev/Prod, Vercel Production, smoke test e rollback.
- `docs/DEV_ONBOARDING.md`: checklist para devs configurarem ambiente local, Supabase CLI, Vercel CLI e fluxo seguro com Codex.
- `docs/UI_UX_GUIDE.md`: padroes visuais.
- `docs/FEATURES_BACKLOG.md`: roadmap e prioridades.
- `README.md`: entrada rapida para humanos.

Uso operacional de status:

- `state.md` e a memoria viva e granular do projeto.
- `state.md` deve ser atualizado ao final de toda entrega relevante.
- `docs/CURRENT_STATUS.md` e um resumo executivo de alto nivel do estado atual.
- `docs/CURRENT_STATUS.md` nao precisa ser atualizado em toda entrega pequena ou incremental.
- Atualizar `docs/CURRENT_STATUS.md` quando houver mudanca de fase, marco importante, conclusao de modulo relevante, mudanca de arquitetura/modelo de dados, deploy significativo ou revisao documental ampla.
- Em caso de divergencia, `state.md` prevalece como fonte mais recente.

Regra de conflito:

- `state.md` vence para estado atual.
- Specs tematicas vencem para comportamento esperado do modulo.
- Codigo e migrations representam a realidade implementada; divergencias com a documentacao devem ser apontadas antes de mudar.
- Relatorios historicos datados nao devem ser tratados como estado atual.

## Principio do produto

A Global RPX deve nascer como uma plataforma web enxuta para cotacoes preliminares, simulacoes internas e relacionamento com clientes.

Nao transformar o produto em ERP completo no inicio.

Priorizar:

- Clareza para o cliente.
- Operacao simples para a RPX.
- Navegacao objetiva.
- Componentes reutilizaveis.
- Evolucao incremental por fases.

## Stack e arquitetura

Stack alvo:

- Next.js com App Router.
- TypeScript.
- Tailwind CSS.
- Supabase Auth.
- Supabase Postgres.
- Supabase Storage para anexos futuros.
- Vercel.

Estrutura principal:

- `src/app`: rotas e layouts.
- `src/components`: componentes reutilizaveis.
- `src/lib`: Supabase, auth, helpers e regras.
- `supabase/migrations`: SQL de banco.
- `docs`: especificacoes de produto.
- `state.md`: estado vivo do projeto.

## Regras de implementacao

- Seguir o escopo da fase registrada em `state.md`.
- Nao implementar funcionalidade completa quando o pedido for apenas fundacao ou front estatico.
- Preferir componentes compartilhados para formulario, tabela, cards e estados vazios.
- Evitar duplicar markup de tabelas e formularios quando houver chance clara de reuso.
- Manter as alteracoes pequenas, coesas e alinhadas aos documentos.
- Nao remover mudancas existentes sem pedido explicito.
- Atualizar `state.md` ao final de cada entrega relevante.
- Nao acionar deploy manual na Vercel a cada entrega. Fazer push no GitHub normalmente; aguardar pedido explicito do usuario para publicar/promover ou acompanhar deploy na Vercel durante rodadas de multiplos ajustes. O `vercel.json` deve manter `git.deploymentEnabled: false` para evitar deploy automatico por push.

### Classificacao de risco

Antes de editar, classifique a tarefa:

- Baixo risco: texto, documentacao simples, ajuste visual isolado, espacamento ou correcao pequena sem impacto em dados.
- Medio risco: CRUD, filtros, tabela, formulario, componente compartilhado, Server Action nao sensivel ou layout usado em multiplas telas.
- Alto risco: auth, permissoes, RLS, migrations, modelo de dados, deploy, rotas principais, calculo da calculadora, contratos entre cliente/admin ou mudancas em `app_users`, `clients`, `quotes` ou `simulations`.

Tarefas de baixo risco podem ser executadas com plano breve quando o pedido for claro. Tarefas de medio e alto risco exigem plano antes de editar, contendo entendimento, risco, impacto, arquivos provaveis e validacoes. So comecar a edicao depois de aprovacao explicita do usuario.

### Contratos protegidos

Nao alterar sem destacar no plano:

- nomes de tabelas e colunas;
- tipos TypeScript compartilhados;
- rotas e query params;
- status;
- payloads;
- Server Actions;
- policies RLS;
- comportamento de login;
- regras de calculo;
- estrutura de `quotes`, `simulations`, `clients` e `app_users`.

### Pedidos ambiguos

Quando o pedido for amplo, ambiguo ou puder afetar produto/arquitetura:

- nao implementar de imediato;
- transformar o pedido em requisitos;
- separar impacto em produto, design, banco, permissoes e documentacao;
- propor fases;
- apontar riscos;
- aguardar aprovacao.

### CRUDs administrativos

Seguir o padrao definido em:

- `docs/spec-cruds.md`

Minimos obrigatorios:

- cabecalho com acao principal;
- filtros ocultaveis acima da listagem;
- tabela com rolagem horizontal apenas dentro do proprio container quando necessario;
- coluna de acoes;
- nome principal clicavel quando fizer sentido;
- status com badge compartilhado;
- acoes sensiveis conforme o padrao do modulo, normalmente `Editar` e `Inativar` quando houver soft delete;
- soft delete/inativacao com confirmacao em modal;
- validacao inline em formularios;
- preservacao de filtros, paginacao e ordenacao;
- layout sem barra de rolagem horizontal na pagina inteira.

Formularios administrativos devem seguir o padrao atual do modulo de Clientes:

- validacao server-side como fonte de verdade;
- validacao client-side apenas complementar;
- Server Actions retornando estado estruturado com `fieldErrors`, `values` e `message`, quando aplicavel;
- erros previsiveis inline no campo correto;
- alerta geral no topo apenas como resumo;
- preservacao de dados nao sensiveis apos erro;
- senha e confirmacao limpas apos erro, quando houver dado sensivel;
- e-mail duplicado exibido no campo E-mail;
- erros tecnicos de Supabase/Auth/Postgres convertidos para mensagens amigaveis;
- edicao mantendo senha opcional quando esse for o padrao do formulario.

## Auth e seguranca

- Rotas `/app` pertencem ao cliente.
- Rotas `/admin` pertencem ao Admin RPX.
- Redirecionamento esperado:
  - `admin` -> `/admin/dashboard`
  - `client` -> `/app`
- Usuario deslogado nao acessa rotas internas.
- `SUPABASE_SERVICE_ROLE_KEY` nunca deve ir para codigo client.
- RLS deve proteger dados de cliente por `client_id`.
- A base de usuarios da aplicacao deve ficar em tabela propria da app, independente do provedor de autenticacao. Usar `app_users` como fonte de verdade para perfis, papeis e futuros cadastros administrativos/exportacoes.
- `profiles` nao deve ser usado como fonte principal da aplicacao.
- Toda acao administrativa sensivel deve validar permissao no servidor.
- UI nao e camada de seguranca.
- Service role so pode ser usada em contexto server-side seguro.

### Modo mock e preview

O modo mock e o preview local sao fallback de desenvolvimento/demonstracao. Quando Supabase real estiver configurado, o app deve usar autenticacao e dados reais. No fallback mock, a sessao usa o cookie local:

```text
global_rpx_mock_user
```

Usuarios mock:

- `cliente1@gmail.com`
- `cliente2@gmail.com`
- `admin@globalrpx.com`

Dados mock da calculadora devem ficar separados por usuario. A chave atual de localStorage segue o formato:

```text
global-rpx-quotes:{email}
```

Quando migrar para Supabase, preservar a ideia de isolamento por cliente usando `client_id` e RLS.

### Migrations Supabase

- Nao editar migrations ja aplicadas, salvo pedido explicito.
- Criar nova migration incremental para mudancas de banco.
- Explicar impacto de tabelas, campos, indices, status e policies.
- Validar RLS e permissoes de cliente/admin.
- Atualizar `state.md` ao final da entrega.
- Atualizar `docs/DATABASE_MODEL.md` quando a modelagem mudar.
- Nunca usar `SUPABASE_SERVICE_ROLE_KEY` no client.

### Regras Supabase Dev/Prod

- Usar Supabase Dev por padrao.
- Nunca aplicar migrations em Producao sem dry-run anterior.
- Nunca rodar push em Producao sem confirmacao explicita do usuario.
- Depois de operar em Producao, voltar o link do Supabase CLI para Dev.
- Nunca commitar `.env.supabase.dev`, `.env.supabase.prod` ou qualquer secret.
- Para migrations em Dev, usar `scripts/supabase-db-dry-run-dev.sh` e `scripts/supabase-db-push-dev.sh`.
- Para migrations em Producao, usar `scripts/supabase-db-dry-run-prod.sh` e, so depois, `scripts/supabase-db-push-prod.sh` com `CONFIRM_PROD_DB_PUSH=YES`.
- Para deploy de producao, seguir `docs/DEPLOYMENT.md`.
- Vercel Production deve permanecer apontando para Supabase Prod; quem volta para Dev apos operacao de producao e o link do Supabase CLI/local.
- Nao fazer deploy Vercel sem build local e smoke test planejado.
- Para onboarding de outro dev ou maquina nova, seguir `docs/DEV_ONBOARDING.md`.

## Calculadora

A calculadora e o primeiro modulo funcional.

Ela deve permitir estimativa preliminar de custo Brasil e economia estimada via RPX.

Campos centrais:

- Nome do produto.
- HS Code ou NCM sugerido.
- Imagens do produto.
- Foto do cartao ou contato do fornecedor.
- FOB unitario USD.
- Quantidade.
- FOB total USD.
- Taxa de cambio interna.
- Fator RPX interno.
- Fator importacao direta interno.

Calculos centrais:

- FOB total USD = FOB unitario USD x quantidade.
- Custo unitario via RPX BRL = FOB unitario USD x dolar usado x fator RPX.
- Custo total via RPX BRL = custo unitario via RPX BRL x quantidade.
- Custo unitario importacao direta BRL = FOB unitario USD x dolar usado x fator importacao direta.
- Custo total importacao direta BRL = custo unitario importacao direta BRL x quantidade.
- Economia estimada BRL = custo total importacao direta BRL - custo total via RPX BRL.
- Economia estimada % = economia estimada BRL / custo total importacao direta BRL.

Taxa de cambio:

- Consultar a PTAX venda mais recente disponivel do Banco Central em tempo de execucao.
- Usar internamente `PTAX venda x 1.03`.
- Nao exibir ao cliente PTAX, taxa ajustada ou o acrescimo interno de 3%.
- Bloquear o calculo com mensagem generica se a consulta falhar.
- Quantidade inicial padrao: `1000`.

Texto obrigatorio:

```text
Estimativa preliminar sujeita à validação fiscal, logística e operacional.
```

Nao apresentar economia como garantia.

Regras de exposicao:

- O fator RPX e parametro comercial interno.
- Valor padrao inicial: `1.8`.
- Nao exibir nem permitir edicao do fator RPX na area do cliente.
- O fator RPX deve ser configurado futuramente no painel administrativo.
- O fator de importacao direta tambem e parametro interno.
- Valor padrao inicial: `2.2`.
- Nao exibir nem permitir edicao do fator de importacao direta na area do cliente.
- Fotos do produto e fotos de contato do fornecedor devem permanecer como categorias separadas.

Fluxo da calculadora:

- Primeiro coletar dados do produto e do fornecedor.
- Fornecedor e valido quando houver nome, e-mail e telefone ou foto do cartao/contato.
- Exibir totalizadores somente depois do clique em `Fazer calculo`.
- Alteracoes posteriores nos dados invalidam o resultado e exigem novo calculo.
- Etapas 1 e 2 funcionam como sanfona: somente uma fica aberta.
- Na Etapa 2, manter `Salvar cotacao` e `Refazer calculo` no topo.
- Refazer preserva os dados e retorna para a Etapa 1.
- OCR de cartao e futuro; nesta fase validar apenas que uma imagem foi anexada.

### NCM

O campo `HS Code ou NCM sugerido` deve usar autocomplete baseado na tabela NCM oficial.

Arquivos atuais:

- Fonte completa baixada: `data/ncm-oficial.json`
- Dataset enxuto para o app: `public/data/ncm.json`
- Script de normalizacao: `scripts/build-ncm-data.mjs`

Regras:

- Permitir busca por codigo ou descricao.
- Mostrar codigo e descricao.
- Ao selecionar, preencher o codigo NCM no campo.
- Sempre tratar o NCM como preliminar e sujeito a validacao fiscal.
- Nao prometer classificacao fiscal automatica oficial.

## Design

- Visual profissional e limpo.
- Mobile-first.
- Identidade Global RPX:
  - Azul principal.
  - Vermelho de destaque.
  - Fundo claro.
  - Logo em `public/logo-global-rpx-horizontal.png`.
- Evitar telas com excesso de texto explicativo.
- Priorizar interfaces de trabalho: formularios claros, tabelas, cards de resumo e navegacao previsivel.

## Preview local

Existe um servidor de preview temporario:

```text
scripts/preview-server.mjs
```

Ele serve uma visualizacao temporaria quando o app Next nao puder rodar por falta de dependencias.

Atualmente o preview tambem simula:

- Login por cookie.
- Logout.
- Calculadora dinamica.
- Historico separado por usuario usando localStorage.

O preview nao substitui o app real em `src/app`.

## Atualizacao documental obrigatoria

Ao final de mudancas relevantes:

- CRUD, filtros, tabela ou formulario administrativo: atualizar `docs/spec-cruds.md`.
- Calculadora, cotacoes, historico ou imagens: atualizar `docs/especificacao-calculadora.md`.
- Banco, tabelas, campos, status, RLS ou migrations: atualizar `docs/DATABASE_MODEL.md`.
- Auth, roles, permissoes ou middleware: atualizar `docs/AUTH_AND_PERMISSIONS.md`.
- Rotas ou telas: atualizar `docs/ROUTES_AND_SCREENS.md`.
- Stack, scripts, ambiente ou deploy: atualizar `docs/TECH_STACK.md`.
- Entrega relevante: sempre atualizar `state.md`.

## Validacao minima

- Baixo risco: revisar diff; rodar typecheck/lint se tocar TypeScript ou React.
- Medio risco: rodar `npm run typecheck`, `npm run lint` e teste manual do fluxo afetado.
- Alto risco: rodar `npm run typecheck`, `npm run lint`, `npm run build`, teste manual/browser, validacao de migrations/RLS quando houver banco e validar cenario admin/cliente quando envolver permissoes.

## Ao finalizar uma entrega

Sempre atualizar `state.md` com:

- Data.
- O que foi feito.
- Arquivos principais alterados.
- O que foi validado.
- O que nao foi possivel validar.
- Proxima etapa recomendada.

Se a entrega mudar escopo, roadmap, stack, rotas ou modelo de dados, atualizar tambem este `AGENTS.md` quando necessario.

Na resposta final ao usuario, resumir:

- o que foi feito;
- arquivos alterados;
- validacoes executadas;
- o que nao foi possivel validar;
- como testar, quando aplicavel;
- proximas etapas recomendadas;
- pendencias ou riscos.
