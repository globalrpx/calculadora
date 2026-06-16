# Agents - Global RPX

Este arquivo orienta qualquer nova sessao/agente trabalhando na plataforma Global RPX.

## Antes de mexer no projeto

Leia, nesta ordem:

1. `state.md`
2. `docs/visao-geral-produto.md`
3. `docs/plano-fundacao-sistema.md`
4. `docs/especificacao-calculadora.md`, quando a tarefa envolver calculadora, cotacoes, historico ou imagens.

Depois de ler, confirme mentalmente:

- Qual fase esta ativa.
- O que ja foi entregue.
- O que ficou pendente.
- Qual arquivo ou modulo a tarefa deve alterar.

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

- Em tarefas de construcao, antes de implementar, primeiro resumir o que foi entendido e apresentar um plano curto de execucao. So comecar os edits depois da aprovacao explicita do usuario.
- Seguir o escopo da fase registrada em `state.md`.
- Nao implementar funcionalidade completa quando o pedido for apenas fundacao ou front estatico.
- Preferir componentes compartilhados para formulario, tabela, cards e estados vazios.
- Evitar duplicar markup de tabelas e formularios quando houver chance clara de reuso.
- Manter as alteracoes pequenas, coesas e alinhadas aos documentos.
- Nao remover mudancas existentes sem pedido explicito.
- Atualizar `state.md` ao final de cada entrega relevante.
- Nao acionar deploy manual na Vercel a cada entrega. Fazer push no GitHub normalmente; aguardar pedido explicito do usuario para publicar/promover ou acompanhar deploy na Vercel durante rodadas de multiplos ajustes. O `vercel.json` deve manter `git.deploymentEnabled: false` para evitar deploy automatico por push.

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

### Modo mock atual

Enquanto Supabase real nao estiver configurado, usar cookie local para simular sessao:

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

## Ao finalizar uma entrega

Sempre atualizar `state.md` com:

- Data.
- O que foi feito.
- Arquivos principais alterados.
- O que foi validado.
- O que nao foi possivel validar.
- Proxima etapa recomendada.

Se a entrega mudar escopo, roadmap, stack, rotas ou modelo de dados, atualizar tambem este `agents.md` quando necessario.
