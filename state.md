# State - Plataforma Global RPX

Ultima atualizacao: 2026-06-16

## Como usar este arquivo

Este arquivo e a memoria operacional do projeto. Ao terminar cada versao, funcionalidade ou bloco relevante de trabalho, atualizar:

- Status atual.
- O que foi entregue.
- O que ficou pendente.
- Decisoes tecnicas e de produto.
- Proxima etapa recomendada.

Antes de iniciar uma nova sessao, ler este arquivo junto com `agents.md` e os documentos em `docs/`.

## Contexto de produto

Referencia principal:

- `docs/visao-geral-produto.md`
- `docs/plano-fundacao-sistema.md`
- `docs/especificacao-calculadora.md`

Objetivo do produto:

Criar uma plataforma web enxuta para a Global RPX centralizar cotacoes preliminares, simulacoes internas e relacionamento operacional com clientes. A plataforma deve comecar pequena, sem virar ERP completo no inicio.

Perfis iniciais:

- Admin RPX: acessa painel administrativo, cadastros, parametros, cotacoes e simulacoes.
- Cliente: acessa area do cliente, calculadora e simulacoes publicadas.

Stack alvo:

- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Storage preparado para anexos futuros
- Vercel

## Status atual

Fase atual: Front da Calculadora com login mock.

Estado: fundacao implementada, calculadora dinamica em memoria/localStorage e build Next.js de producao validado.

Servidor de preview atual:

```text
http://127.0.0.1:3002
```

Observacao: o preview em `scripts/preview-server.mjs` continua disponivel. As dependencias do app Next agora estao instaladas e o build passou; o ambiente ainda nao possui npm convencional no PATH, entao a estabilizacao usou um npm temporario.

## Entregue ate agora

### 2026-06-16 - Preparacao local para versionamento GitHub

- `.gitignore` revisado para ignorar artefatos locais, dependencias, builds, arquivos de ambiente e logs de package managers.
- `.DS_Store` local removido antes do versionamento.
- Arquivos do projeto preparados para commit inicial em Git.
- Remote GitHub ainda nao configurado neste momento.

Arquivos principais:

- `.gitignore`
- `state.md`

Validado:

- `git status` sem `.DS_Store`, `.env`, `.env.local`, `node_modules/`, `.next/` ou `.vercel/`.

Nao foi possivel validar ainda:

- Push para GitHub, pois nenhum remote `origin` estava configurado.

Proxima etapa recomendada:

- Configurar o remote `origin` com a URL do repositorio GitHub e executar o push da branch `main`.

### 2026-06-12 - Estabilizacao tecnica do Next.js

- Dependencias instaladas: 424 pacotes.
- `package-lock.json` v3 criado.
- `npm run lint` aprovado sem erros.
- `npm run typecheck` aprovado apos tipagem dos callbacks de cookie do Supabase.
- `npm run build` aprovado, com 17 rotas geradas.
- Build executado localmente em modo producao; rotas publicas, protecao de `/app` e PTAX validadas por HTTP.
- Nenhuma regra de negocio ou arquitetura alterada.
- `docs/BUILD_REPORT.md` criado com comandos, falhas, correcoes e riscos.
- Audit registrou 2 vulnerabilidades moderadas no PostCSS interno do Next, sem correcao compativel sugerida.

Arquivos tecnicos alterados:

- `package-lock.json`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`

Proxima etapa recomendada:

- Padronizar Node LTS e CI antes de iniciar a integracao real com Supabase.

### 2026-06-12 - Pacote completo de documentacao tecnica

- Projeto inventariado integralmente como Next.js 15 + React 19, esclarecendo que nao usa Vite.
- Criados documentos de visao, stack, estrutura, rotas, banco, auth, backlog, Supabase, UI/UX e status.
- Modelo inicial de banco proposto com cotacoes, snapshots de calculo, fornecedores, NCM, impostos, anexos, status e simulacoes.
- RLS e isolamento por `client_id` documentados.
- README principal refeito com instalacao, execucao, Supabase, Vercel e links.
- `docs/AI_CONTEXT.md` criado para transferencia direta a outra IA/desenvolvedor.
- Nenhum codigo funcional foi removido ou alterado nesta entrega.

Arquivos criados/atualizados:

- `docs/PROJECT_OVERVIEW.md`
- `docs/TECH_STACK.md`
- `docs/FOLDER_STRUCTURE.md`
- `docs/ROUTES_AND_SCREENS.md`
- `docs/DATABASE_MODEL.md`
- `docs/AUTH_AND_PERMISSIONS.md`
- `docs/FEATURES_BACKLOG.md`
- `docs/API_AND_SUPABASE_PLAN.md`
- `docs/UI_UX_GUIDE.md`
- `docs/CURRENT_STATUS.md`
- `docs/AI_CONTEXT.md`
- `README.md`

### 2026-06-12 - PTAX automatica e refinamento dos resultados

- Integracao server-side com a PTAX venda mais recente disponivel do Banco Central.
- Consulta feita em tempo de execucao e sem cache.
- Taxa interna calculada como `PTAX venda x 1.03`.
- Dolar, taxa ajustada e acrescimo interno ocultos da area do cliente e dos resumos copiados.
- Calculo bloqueado com mensagem generica quando a PTAX nao estiver disponivel.
- Quantidade inicial alterada de `100` para `1000`.
- Resultado reorganizado em duas colunas, com numeros menores e linguagem mais discreta.
- Preview local atualizado com o endpoint `/api/exchange-rate`.

Arquivos principais:

- `src/lib/exchange-rate/get-ptax.ts`
- `src/app/api/exchange-rate/route.ts`
- `src/components/calculator/CalculatorClient.tsx`
- `scripts/preview-server.mjs`
- `docs/especificacao-calculadora.md`
- `agents.md`

Validado:

- Endpoint oficial do Banco Central retornando a PTAX venda.
- Endpoint local `/api/exchange-rate` retornando HTTP 200, sem cache, com taxa ajustada.
- Formulario sem campo de dolar e com quantidade inicial `1000`.
- Sintaxe do preview com `node --check`.

Nao foi possivel validar automaticamente:

- O preenchimento completo do formulario nesta rodada, por indisponibilidade do clipboard virtual do navegador integrado.
- Build e typecheck do Next.js, pois as dependencias ainda nao estao instaladas neste ambiente.

### Documentacao

- Documentos originais copiados para `docs/`.
- `state.md` criado para manter memoria entre sessoes.
- `agents.md` criado com instrucoes gerais do projeto.

### Fundacao Next.js

- `package.json` com Next.js, React, Tailwind, TypeScript e Supabase.
- `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`.
- `src/app/layout.tsx` e `src/app/globals.css`.
- `.env.example` com variaveis Supabase.
- `vercel.json` preparado para deploy Next.js.

### Supabase

- Cliente Supabase browser em `src/lib/supabase/client.ts`.
- Cliente Supabase server em `src/lib/supabase/server.ts`.
- Middleware Supabase em `src/lib/supabase/middleware.ts`.
- Auth actions em `src/lib/actions/auth.ts`.
- Helpers de sessao e role em `src/lib/auth/get-session-profile.ts`.
- Migration inicial em `supabase/migrations/001_foundation.sql` com:
  - `clients`
  - `profiles`
  - RLS inicial de leitura por usuario/admin.

### Auth mock

- Quando Supabase nao esta configurado, o app usa cookie mock:
  - `global_rpx_mock_user`
- Usuarios ficticios disponiveis:
  - `cliente1@gmail.com`
  - `cliente2@gmail.com`
  - `admin@globalrpx.com`
- Login mock implementado em `src/lib/actions/auth.ts`.
- Sessao mock implementada em `src/lib/auth/get-session-profile.ts`.
- Protecao mock de rotas implementada em `src/lib/supabase/middleware.ts`.

### Rotas publicas

- `/`
- `/login`

### Area do cliente

- `/app`
- `/app/calculadora`
- `/app/simulacoes`
- Layout com header, logo, usuario, logout e navegacao.
- Conteudo ainda placeholder.

### Admin RPX

- `/admin`
- `/admin/dashboard`
- `/admin/clientes`
- `/admin/fornecedores`
- `/admin/despachantes`
- `/admin/usuarios`
- `/admin/parametros`
- `/admin/cotacoes`
- `/admin/simulacoes`
- Layout com header, logo, usuario, logout e sidebar.
- Conteudo ainda placeholder.

### Componentes criados

- `src/components/layout/Brand.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/PageHeader.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/DataTable.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/FormField.tsx`
- `src/components/ui/TablePlaceholder.tsx`

### Calculadora mock

- Calculadora dinamica criada em `src/components/calculator/CalculatorClient.tsx`.
- Regras de calculo centralizadas em `src/lib/calculator/calculate-quote.ts`.
- Autocomplete de NCM por base oficial da Receita/Portal Unico:
  - Fonte baixada: `data/ncm-oficial.json`
  - Dataset normalizado: `public/data/ncm.json`
  - Script de geracao: `scripts/build-ncm-data.mjs`
- `/app/calculadora` deixou de ser placeholder e agora tem:
  - Nova cotacao.
  - Historico.
  - Detalhe de cotacao.
  - Calculo em tempo real.
  - Busca de NCM por codigo ou descricao.
  - Upload visual/mock de imagens.
  - Copiar resumo.
  - Duplicar cotacao no app Next.
- Dados salvos em `localStorage`, separados por e-mail do usuario mock:
  - `global-rpx-quotes:cliente1@gmail.com`
  - `global-rpx-quotes:cliente2@gmail.com`

### Identidade visual

- Logo real vindo de `/Users/rodrigolopes/Downloads/logo global rpx.pdf`.
- Asset final usado no topo:
  - `public/logo-global-rpx-horizontal.png`
- Arquivo de pagina original convertido mantido em:
  - `public/logo-global-rpx-original-page.png`
- Logo SVG provisoria ainda existe:
  - `public/logo-global-rpx-horizontal.svg`

### Preview local

- `scripts/preview-server.mjs` criado para visualizar e testar telas sem depender de `node_modules`.
- Preview atualizado com login mock, cookie, logout e calculadora dinamica.
- Preview validado com HTTP 200 em:
  - `/`
  - `/admin/dashboard`
  - `/app/calculadora`
- Preview validado com:
  - Login POST para `cliente1@gmail.com`.
  - Calculadora acessando via cookie mock.
  - Cotacao salva no historico de `cliente1@gmail.com`.
  - `cliente2@gmail.com` sem acesso ao historico de `cliente1@gmail.com`.

## Nao entregue ainda

- Instalar dependencias reais (`node_modules`).
- Rodar `next dev`.
- Rodar `npm run build`.
- Rodar lint/typecheck.
- Conectar a um projeto Supabase real com variaveis reais.
- Criar usuarios reais de teste no Supabase.
- Publicar na Vercel.
- Persistir cotacoes no Supabase.
- Upload real de imagens.
- Historico real de cotacoes no banco.
- CRUD real de admin.
- Simulacoes reais.

## Proxima etapa: Evoluir Calculadora Mock e Preparar Banco

Objetivo: refinar a experiencia visual/interativa da calculadora e preparar a transicao de mock/localStorage para Supabase.

Escopo recomendado:

- Melhorar UI da calculadora conforme feedback visual.
- Adicionar filtros mock no historico:
  - Busca por produto.
  - Status.
  - Periodo.
- Melhorar detalhe de cotacao com todos os campos da especificacao.
- Adicionar botao para limpar historico mock por usuario, se necessario.
- Preparar migration da fase de calculadora:
  - `quotes`
  - `quote_images`
  - `calculation_parameters`
- Preparar Storage `quote-images`.
- Preparar RLS real por `client_id`.
- Manter aviso obrigatorio:

```text
Estimativa preliminar sujeita à validação fiscal, logística e operacional.
```

Nesta etapa, ainda pode nao salvar no Supabase. Priorizar UX, estrutura de componentes e compatibilidade futura com banco.

## Componentes compartilhados a criar em breve

Para evitar repeticao, criar uma base reutilizavel antes ou durante a calculadora:

- `DataTable`: criado.
- `FormField`: criado.
- `TextInput`: criado dentro de `FormField.tsx`.
- `NumberInput`: criado dentro de `FormField.tsx`.
- `SelectInput`
- `FileUpload`
- `StatCard`
- `EmptyState`
- `Tabs` ou controle segmentado para Nova cotacao/Historico.
- `PageActions` ou area padrao de botoes de pagina.

Diretriz: criar componentes apenas quando houver uso real em pelo menos duas telas ou quando a tela da calculadora ficar complexa demais.

## Ordem sugerida de evolucao

1. Fundacao visual e navegacao estatica.
2. Front da calculadora com calculos em memoria.
3. Componentes reutilizaveis de formulario e tabela.
4. Refinos visuais e de UX na calculadora mock.
5. Supabase real da calculadora:
   - `quotes`
   - `quote_images`
   - `calculation_parameters`
   - Storage `quote-images`
   - RLS.
6. Historico e detalhe de cotacoes persistidos.
7. Admin visualizando cotacoes.
8. CRUD basico de parametros.
9. Simulacoes RPX.
10. Publicacao de simulacoes para cliente.
11. Deploy Vercel e ambientes.

## Decisoes importantes

- Nao implementar ERP completo neste momento.
- Nao implementar calculadora completa durante a fundacao.
- NCM/HS Code sempre deve ser tratado como preliminar.
- Economia via RPX deve ser apresentada como estimativa comercial, nunca como garantia.
- Supabase Service Role nunca deve ser usado no client.
- O app Next real fica em `src/app`.
- O preview em Node e temporario e nao deve substituir o app Next.
- Manter UI profissional, objetiva, mobile-first e alinhada a Global RPX.
- Durante a fase mock, separar dados por usuario usando cookie + chave de localStorage por e-mail.

## Riscos e pendencias tecnicas

- Ambiente local atual nao possui gerenciador de pacotes no PATH.
- Sem instalar dependencias, nao ha validacao real de build Next.js.
- Supabase ainda nao foi configurado com projeto real.
- RLS inicial existe apenas na migration; precisa ser validada no Supabase.
- O logo foi recortado a partir de PDF; se houver asset oficial em SVG/PNG transparente, substituir.

## Checklist da versao atual

- [x] Copiar documentos para `docs/`.
- [x] Criar fundacao Next.js.
- [x] Criar telas estaticas publicas, cliente e admin.
- [x] Criar Supabase Auth/middleware/migration inicial.
- [x] Criar preview estatico local.
- [x] Aplicar logo real no topo.
- [x] Criar `state.md`.
- [x] Criar `agents.md`.
- [x] Criar login mock por cookie.
- [x] Criar calculadora dinamica em memoria.
- [x] Separar historico mock por usuario.
- [ ] Instalar dependencias reais.
- [ ] Rodar Next.js real localmente.
- [ ] Configurar Supabase real.
- [ ] Deploy Vercel.

## Log de versoes

### 2026-06-03 - Fundacao inicial

- Criada base Next.js + TypeScript + Tailwind.
- Criadas rotas publicas, area do cliente e admin.
- Criada conexao estrutural com Supabase.
- Criada migration inicial de `profiles` e `clients`.
- Criado preview estatico em Node na porta 3002.
- Aplicado logo real da Global RPX a partir do PDF enviado.
- Criados arquivos `state.md` e `agents.md`.

### 2026-06-03 - Calculadora mock e sessao por cookie

- Implementado login mock por cookie para `cliente1@gmail.com`, `cliente2@gmail.com` e `admin@globalrpx.com`.
- Implementada calculadora dinamica em `src/components/calculator/CalculatorClient.tsx`.
- Criados componentes compartilhados de formulario, tabela e estado vazio.
- Criadas funcoes de calculo e formatacao em `src/lib/calculator/calculate-quote.ts`.
- Atualizado preview `scripts/preview-server.mjs` com login, logout, calculadora dinamica e historico por usuario.
- Validado no browser embutido:
  - Salvar cotacao para `cliente1@gmail.com`.
  - Trocar para `cliente2@gmail.com`.
  - Confirmar historico separado.

### 2026-06-04 - Ajuste de apresentacao da calculadora

- Removida a palavra `mock` da experiencia visivel da calculadora.
- Alterados os cards de resultado para comparacao comercial:
  - `Valor fazendo via RPX`
  - `Valor importacao direta`
  - `Diferenca via RPX`
- Mantida a diferenca/economia como consequencia da comparacao, sem ser o primeiro rótulo da experiencia.
- Atualizados textos no app Next e no preview local.

### 2026-06-04 - Autocomplete NCM

- Baixada base oficial NCM em JSON do Portal Unico/Siscomex, linkado pela Receita Federal.
- Criado `scripts/build-ncm-data.mjs` para normalizar a base.
- Gerado `public/data/ncm.json` com 10.515 codigos NCM completos.
- Implementado autocomplete no campo `HS Code ou NCM sugerido`.
- Busca funciona por:
  - Codigo com ou sem pontuacao.
  - Texto da descricao.
- Ao selecionar uma sugestao, o codigo entra no campo e a descricao fica visivel como apoio.
- Preview local passou a servir `/data/ncm.json`.
- Validado:
  - `public/data/ncm.json` gerado com 10.515 itens.
  - Busca local por `garrafa` retornando itens NCM relacionados.
  - Endpoint do preview `/data/ncm.json` respondendo HTTP 200.

### 2026-06-12 - Fator interno, contato do fornecedor e destaque de economia

- Fator RPX removido da interface do cliente.
- Valor padrao interno mantido em `1.8`.
- Spec atualizada para configurar futuramente `default_rpx_factor` apenas no painel administrativo.
- Fator RPX removido do resumo copiado pelo cliente.
- Adicionado campo separado `Foto do cartao ou contato do fornecedor`.
- Anexos separados em duas categorias:
  - `product`
  - `supplier_contact`
- Modelo futuro de `quote_images` atualizado com `image_type`.
- Card de diferenca alterado para `Sua economia fazendo via RPX`, com cor verde de maior destaque.
- App Next e preview local atualizados com os novos campos e regras.

### 2026-06-12 - Fluxo em duas etapas e validacao do fornecedor

- Fator de importacao direta removido da interface e do resumo do cliente.
- Valor interno padrao mantido em `2.2`.
- Fluxo alterado:
  - Primeiro produto e fornecedor.
  - Depois clique em `Fazer calculo`.
  - Totalizadores aparecem somente apos validacao.
- Identificacao do fornecedor aceita:
  - Nome, e-mail e telefone completos; ou
  - Foto do cartao/contato do fornecedor.
- Adicionados campos de fornecedor ao registro da cotacao e ao historico.
- Alteracoes no formulario invalidam o resultado anterior.
- OCR registrado como evolucao futura, com suporte potencial a multiplos idiomas.
- Spec, `agents.md`, app Next e preview local atualizados.

### 2026-06-12 - Etapas em formato sanfona

- Etapa 1 e Etapa 2 alteradas para exibicao exclusiva.
- Ao clicar em `Fazer calculo`, o formulario recolhe e o resultado abre com animacao.
- `Salvar cotacao` movido para o topo da Etapa 2.
- Adicionado `Refazer calculo` no topo da Etapa 2.
- Refazer retorna ao formulario preservando os dados preenchidos.
- App Next, preview, spec, `agents.md` e `state.md` atualizados.

### 2026-06-12 - PTAX automatica e resultado mais discreto

- Adicionado endpoint server-side sem cache para consultar a PTAX venda mais recente disponivel.
- Aplicado internamente o acrescimo de 3% sobre a PTAX.
- Removido o dolar da interface do cliente e dos resumos copiados.
- Quantidade inicial alterada para `1000`.
- Resultado reorganizado em duas colunas com tipografia menor.
- Textos dos totalizadores ajustados para uma apresentacao comercial mais discreta.

### 2026-06-12 - Documentacao para continuidade do projeto

- Criado pacote de documentacao com 10 guias tecnicos e de produto.
- README atualizado para refletir a arquitetura Next.js real.
- Criado `docs/AI_CONTEXT.md` para continuidade por outra IA.
- Documentados banco Supabase, RLS, backlog, rotas, UI/UX, deploy e riscos.
- Registrada explicitamente a divergencia entre o pedido React + Vite e o repositorio Next.js 15.
