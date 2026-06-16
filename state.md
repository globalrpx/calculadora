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

### 2026-06-16 - Cadastro publico de clientes

- Tela `/cadastro` criada com campos:
  - Nome;
  - E-mail;
  - Celular;
  - Senha;
  - Aceite dos termos.
- Tela `/termos` criada como pagina publica inicial de termos de uso.
- Link `Faça seu cadastro` adicionado abaixo do formulario de login.
- Link `Efetuar login` adicionado abaixo do formulario de cadastro.
- Home atualizada com botao `Cadastre-se grátis` ao lado de `Entrar`.
- Action `signUpAction` criada usando Supabase Auth.
- Novos cadastros passam a receber perfil `client`.
- Migration `002_public_signup_profiles.sql` criada e aplicada no Supabase remoto:
  - coluna `phone` em `profiles`;
  - funcao `handle_new_user_profile()`;
  - trigger em `auth.users` para criar/atualizar `profiles`.
- `agents.md` atualizado para orientar que deploy manual na Vercel so deve ocorrer por pedido explicito durante rodadas de multiplos ajustes.

Arquivos principais:

- `src/app/cadastro/page.tsx`
- `src/app/termos/page.tsx`
- `src/app/login/page.tsx`
- `src/app/page.tsx`
- `src/lib/actions/auth.ts`
- `src/lib/types.ts`
- `src/lib/auth/mock-users.ts`
- `supabase/migrations/002_public_signup_profiles.sql`
- `agents.md`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- `npm run build` aprovado com 19 rotas.
- `supabase db push` aplicou a migration `002`.
- `supabase migration list` confirmou `001` e `002` em local/remoto.
- Cadastro direto via Supabase Auth criou usuario e perfil `client` com nome, e-mail e celular.
- `/`, `/login`, `/cadastro` e `/termos` renderizando localmente com links/campos esperados.

Nao foi possivel validar ainda:

- Fluxo completo visual de cadastro via browser embutido apos submit, pois o browser reteve uma pagina de erro de conexao durante o reinicio do dev server.
- Deploy Vercel desta entrega, por pedido de aguardar fechamento da rodada antes de publicar.

Proxima etapa recomendada:

- Testar a rota `/cadastro` online quando o usuario pedir o proximo deploy Vercel.

### 2026-06-16 - Logo do login com link para home

- Componente `Brand` passou a aceitar `href` opcional.
- Logo da tela `/login` configurado como link para `/`.
- Demais usos do `Brand` permanecem sem link.

Arquivos principais:

- `src/components/layout/Brand.tsx`
- `src/app/login/page.tsx`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- Verificacao local em `http://localhost:3001/login` confirmou um link `href="/"` no logo.
- Deploy automatico Vercel concluido com sucesso.
- Verificacao online em `https://calculadora-global-rpx-s-projects.vercel.app/login` confirmou o clique no logo navegando para `/`.

Nao foi possivel validar ainda:

- Nada nesta entrega.

Proxima etapa recomendada:

- Seguir para a proxima melhoria de UX ou para a migration da calculadora.

### 2026-06-16 - Deploy Vercel de producao para teste online

- Vercel CLI autenticado fora do ambiente Codex com a conta `globalrpxdev-6068`.
- Projeto local vinculado ao time Vercel `global-rpx-s-projects`.
- Projeto Vercel criado/vinculado: `calculadora`.
- Repositorio GitHub `globalrpx/calculadora` conectado ao projeto Vercel.
- Env vars de producao configuradas na Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy concluido com sucesso na Vercel.
- SSO deployment protection desativada para permitir teste publico pela URL.
- URL publica principal:
  - `https://calculadora-global-rpx-s-projects.vercel.app`

Arquivos principais:

- `.vercel/project.json` (local, ignorado pelo Git)
- `state.md`

Validado:

- Build Vercel concluido com `npm run build`.
- `/` retornando HTTP 200 online.
- `/login` retornando HTTP 200 online.
- `/api/exchange-rate` retornando PTAX online.
- Login online com `cliente1@gmail.com` redirecionando para `/app`.
- `vercel git connect` confirmando que `globalrpx/calculadora` ja esta conectado ao projeto.

Nao foi possivel validar ainda:

- Primeiro deploy automatico disparado por push no GitHub.
- Env vars de preview pelo CLI, pois a Vercel ainda exige branch de preview mesmo ao usar o comando recomendado para todos os previews.

Proxima etapa recomendada:

- Fazer um commit pequeno futuro para confirmar deploy automatico por push no GitHub e, se necessario, configurar env vars de Preview pelo painel da Vercel.

### 2026-06-16 - Ambiente local conectado ao Supabase real

- `.env.local` local configurado com URL e chave publica do projeto Supabase.
- Usuarios reais de teste criados no Supabase Auth:
  - `cliente1@gmail.com`
  - `cliente2@gmail.com`
  - `admin@globalrpx.com`
- Clientes e perfis iniciais inseridos nas tabelas `clients` e `profiles`.
- Senha temporaria de desenvolvimento definida para os tres usuarios reais.
- Tela de login ajustada para ocultar atalhos mock quando Supabase real estiver configurado.
- Servidor local reiniciado em `http://localhost:3001` lendo `.env.local`.

Arquivos principais:

- `.env.local` (local, ignorado pelo Git)
- `src/app/login/page.tsx`
- `state.md`

Validado:

- Autenticacao direta no Supabase para cliente 1, cliente 2 e admin.
- Perfil correto retornado para cada usuario real.
- Login real do cliente pelo app redirecionando para `/app`.
- Login real do admin pelo app redirecionando para `/admin/dashboard`.
- Tela `/login` sem atalhos mock em modo Supabase real.
- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.

Nao foi possivel validar ainda:

- Envio real de imagens e persistencia de cotacoes no Supabase, pois essas tabelas ainda nao foram implementadas.

Proxima etapa recomendada:

- Criar migration da calculadora com `quotes`, `quote_images`, `calculation_parameters`, bucket `quote-images` e RLS por `client_id`.

### 2026-06-16 - Vinculo Supabase e migration fundacional aplicada

- Supabase CLI autenticado fora do ambiente Codex com a conta `globalrpx`.
- Projeto local vinculado ao Supabase remoto `Calculadora Global RPX`.
- Project ref vinculado: `wrcgjooqbgxnjztuzfpo`.
- Migration fundacional `001_foundation.sql` aplicada no banco remoto.
- Estrutura inicial criada/confirmada:
  - extensao `pgcrypto`;
  - tabela `clients`;
  - tabela `profiles`;
  - funcao `public.is_admin()`;
  - RLS e policies iniciais de leitura para perfis e clientes.

Arquivos principais:

- `supabase/migrations/001_foundation.sql`
- `state.md`

Validado:

- `supabase projects list` retornando o projeto como `ACTIVE_HEALTHY` e `linked: true`.
- `supabase migration list` com migration local `001` correspondente a remote `001`.
- `supabase db push` finalizado com sucesso.

Nao foi possivel validar ainda:

- Fluxo real de login Supabase no app, pois ainda faltam variaveis `.env.local` e usuarios/perfis reais.

Proxima etapa recomendada:

- Configurar `.env.local` com URL e anon key do Supabase, criar usuarios de teste e inserir registros em `clients`/`profiles`.

### 2026-06-16 - Publicacao inicial no GitHub

- `.gitignore` revisado para ignorar artefatos locais, dependencias, builds, arquivos de ambiente e logs de package managers.
- `.DS_Store` local removido antes do versionamento.
- Arquivos do projeto preparados para commit inicial em Git.
- Commit inicial criado e publicado no GitHub.
- Relatorio de preparacao para GitHub criado em `docs/GITHUB_READY_REPORT.md`.

Arquivos principais:

- `.gitignore`
- `docs/GITHUB_READY_REPORT.md`
- `state.md`

Validado:

- `git status` sem `.DS_Store`, `.env`, `.env.local`, `node_modules/`, `.next/` ou `.vercel/`.
- Remote `origin` configurado para `https://github.com/globalrpx/calculadora.git`.
- Push da branch `main` concluido com sucesso.

Nao foi possivel validar ainda:

- Deploy em ambiente externo.

Proxima etapa recomendada:

- Configurar CI e preparar deploy preview na Vercel antes de integrar Supabase real.

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
