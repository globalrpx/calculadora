# State - Plataforma Global RPX

Ultima atualizacao: 2026-06-17

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

Fase atual: Fundacao autenticada com Supabase real, calculadora persistida e primeira base dinamica do painel administrativo.

Estado: fundacao implementada, calculadora dinamica persistindo cotacoes reais em `quotes`, pedidos de simulacao completa persistindo em `simulations`, autenticacao real funcionando, base de usuarios da aplicacao desacoplada do provedor via `app_users` e modulo administrativo inicial conectado ao banco para dashboard, clientes, cotacoes e usuarios.

Servidor de preview atual:

```text
http://127.0.0.1:3001
```

Observacao: o preview em `scripts/preview-server.mjs` continua disponivel. As dependencias do app Next agora estao instaladas e o build passou; o ambiente ainda nao possui npm convencional no PATH, entao a estabilizacao usou um npm temporario.

## Entregue ate agora

### 2026-06-17 - Persistencia real da calculadora e simulacoes do cliente

- Calculadora da area do cliente deixou de depender do historico em `localStorage` no fluxo principal.
- Clique em `Fazer calculo` agora:
  - consulta a taxa de cambio;
  - calcula a cotacao;
  - salva a cotacao real na tabela `quotes`;
  - exibe o resultado salvo na tela.
- Historico da aba `Historico` agora carrega cotacoes reais do Supabase, isoladas pelo `client_id` do usuario autenticado.
- Acoes do historico ajustadas:
  - abrir detalhe;
  - refazer cotacao existente atualizando o registro original;
  - duplicar cotacao criando novo registro;
  - copiar resumo.
- Botao `Solicitar simulacao completa` agora cria registro real em `simulations` com status `aguardando`.
- Fluxo impede duplicar solicitacao pendente/em andamento para a mesma cotacao.
- Pagina `/app/simulacoes` passou a listar simulacoes reais do cliente, com status, cotacao relacionada e espaco para arquivo futuro.
- Dashboard do cliente passou a mostrar total real de cotacoes e simulacoes.
- Migration `006_client_quotes_persistence.sql` aplicada no Supabase remoto, adicionando campos, policies RLS e indice unico parcial para solicitacoes pendentes por cotacao.

Arquivos principais:

- `supabase/migrations/006_client_quotes_persistence.sql`
- `src/lib/actions/client-quotes.ts`
- `src/lib/client/quotes.ts`
- `src/lib/client/types.ts`
- `src/components/calculator/CalculatorClient.tsx`
- `src/app/app/calculadora/page.tsx`
- `src/app/app/simulacoes/page.tsx`
- `src/app/app/page.tsx`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- `supabase db push --yes` aplicado com sucesso no projeto remoto.
- Teste local no navegador:
  - calculo de cotacao salva em `quotes`;
  - historico persiste apos navegacao;
  - solicitacao de simulacao cria item em `/app/simulacoes`;
  - dashboard do cliente atualiza totalizadores.

Nao foi possivel validar ainda:

- upload real de imagens para Supabase Storage; nesta etapa foram preservados nomes/metadados no payload.
- fluxo administrativo completo de producao/publicacao do PDF da simulacao.

Proxima etapa recomendada:

- Evoluir o modulo administrativo de cotacoes/simulacoes para consumir esses registros, produzir/uploadar o PDF e publicar a simulacao para o cliente.

### 2026-06-16 - Ajuste de zoom aparente no mobile da area restrita

- Investigacao do comportamento em mobile apos login, onde a area restrita parecia abrir com zoom aumentado.
- Causa provavel tratada: overflow horizontal no layout logado, principalmente pela soma de menu mobile, logo e saudacao da conta no header.
- Header logado ajustado para caber melhor em telas pequenas:
  - logo menor no breakpoint mobile;
  - botao de conta com largura maxima e texto truncado;
  - containers com `min-w-0`, `w-full` e gaps menores no mobile.
- Reforco global de `overflow-x: hidden` em `html` e `body`.
- Cards e titulos receberam protecoes contra estouro horizontal.

Arquivos principais:

- `src/app/globals.css`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/AccountMenu.tsx`
- `src/components/layout/Brand.tsx`
- `src/components/layout/PageHeader.tsx`
- `src/components/ui/Card.tsx`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.

Nao foi possivel validar ainda:

- teste visual completo em mobile real antes do deploy; a automacao local do browser falhou durante preenchimento/navegacao, apesar da aplicacao responder.

Proxima etapa recomendada:

- publicar em producao e validar no celular se a area restrita abre sem necessidade de zoom out.

### 2026-06-16 - Correcao operacional do cadastro em producao

- Investigacao do erro online em `/cadastro` concluida com leitura dos logs da Vercel.
- Causa raiz identificada: a server action de cadastro dependia de `SUPABASE_SERVICE_ROLE_KEY`, mas a variavel nao estava configurada no ambiente de producao da Vercel.
- O problema nao estava relacionado ao novo campo opcional `Empresa`.
- O fluxo de cadastro foi endurecido para falhar com redirecionamento controlado em vez de gerar erro 500 quando a `SUPABASE_SERVICE_ROLE_KEY` estiver ausente em algum ambiente.
- A tela `/cadastro` agora exibe mensagem amigavel quando o ambiente de cadastro estiver temporariamente indisponivel por configuracao incompleta.

Arquivos principais:

- `src/lib/actions/auth.ts`
- `src/app/cadastro/page.tsx`

Validado:

- Leitura dos logs de producao da Vercel confirmou o erro `Configure SUPABASE_SERVICE_ROLE_KEY.` no `POST /cadastro`.
- Renderizacao publica de `/cadastro` em producao seguia normal; a quebra ocorria especificamente na submissao do formulario.

Nao foi possivel validar ainda:

- novo envio real do cadastro em producao antes de sincronizar a variavel `SUPABASE_SERVICE_ROLE_KEY` no projeto da Vercel e publicar um novo deploy.

Proxima etapa recomendada:

- sincronizar `SUPABASE_SERVICE_ROLE_KEY` na Vercel, publicar novo deploy e validar o cadastro online ponta a ponta.

### 2026-06-16 - Menu de conta, rota Minha Conta e empresa opcional no cadastro

- Header logado passou a usar menu de conta compacto no lugar do bloco antigo com texto e botao grande de sair.
- O novo trigger exibe saudacao no formato `Ola, Fulano!` com dropdown.
- Dropdown passou a conter:
  - `Minha conta`
  - `Sair`
- O logout agora encerra a sessao e redireciona para a Home `/`.
- Nova rota autenticada `/conta` criada e protegida no middleware.
- A tela `Minha conta` permite:
  - editar nome;
  - editar empresa;
  - editar e-mail;
  - editar telefone;
  - atualizar senha em bloco separado.
- Alteracao de e-mail agora valida duplicidade na base antes de salvar.
- Atualizacao de conta sincroniza:
  - `app_users`;
  - `clients`, quando houver `client_id`;
  - usuario do provider de auth via admin API.
- Cadastro publico em `/cadastro` passou a ter campo `Empresa` opcional.
- O campo opcional `Empresa` agora e persistido no momento do cadastro publico em `clients` e em `user_metadata`.
- Navegacoes de admin e cliente foram extraidas para `src/lib/navigation.ts` para reuso em layouts e na rota `/conta`.

Arquivos principais:

- `src/components/layout/AccountMenu.tsx`
- `src/components/layout/AppShell.tsx`
- `src/lib/actions/account.ts`
- `src/lib/actions/auth.ts`
- `src/lib/navigation.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/conta/page.tsx`
- `src/app/cadastro/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/app/layout.tsx`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- `npm run build` aprovado com a nova rota `/conta`.
- Validacao visual no browser confirmando:
  - menu de conta compacto no header;
  - dropdown com `Minha conta` e `Sair`;
  - tela `/conta` com formularios de dados e senha;
  - campo `Empresa` opcional presente em `/cadastro`.

Nao foi possivel validar ainda:

- submissao real de alteracao de e-mail, para evitar impactar uma conta existente no ambiente.
- submissao real de troca de senha em conta ativa do ambiente.

Proxima etapa recomendada:

- aplicar o mesmo tratamento de dropdown/conta em refinamentos futuros da experiencia logada e replicar o padrao de feedback/acoes nos demais modulos administrativos.

### 2026-06-16 - Padrao de CRUD administrativo e modulo de clientes completo

- Documento `docs/spec-cruds.md` criado para definir o padrao minimo dos CRUDs administrativos.
- `AGENTS.md` atualizado para exigir a leitura desse spec sempre que a tarefa envolver CRUD, filtros, tabelas ou exclusao.
- Nova migration `005_crud_soft_delete.sql` criada e aplicada no Supabase remoto.
- Ajustes de modelagem realizados:
  - `clients.company_name` deixou de ser obrigatorio;
  - `clients.deleted_at` adicionado;
  - `app_users.deleted_at` adicionado;
  - `clients.status` normalizado para `active/inactive`;
  - indice unico de e-mail em `app_users` refeito para considerar apenas registros nao excluidos.
- Login, sessao e middleware passaram a bloquear usuarios com `status != active` ou `deleted_at` preenchido.
- Tabela base `DataTable` refatorada para:
  - manter rolagem horizontal apenas dentro da tabela;
  - evitar barra horizontal na pagina inteira;
  - suportar melhor links e acoes por linha.
- Modal de confirmacao reutilizavel criada para exclusoes com soft delete.
- CRUD de Clientes fechado com:
  - listagem dedicada;
  - tela `Novo cliente`;
  - tela `Editar cliente`;
  - filtros por nome, empresa, origem, status, data inicial e data final;
  - coluna `Acoes`;
  - link clicavel no nome principal da linha;
  - exclusao logica com confirmacao;
  - desativacao do usuario vinculado da aplicacao quando houver.
- O campo `Empresa` passou a ser opcional no formulario administrativo de clientes.
- Para cadastros sem empresa, a listagem exibe `Pessoa fisica`.
- Cadastro publico via site deixou de preencher empresa automaticamente com o nome da pessoa.

Arquivos principais:

- `docs/spec-cruds.md`
- `AGENTS.md`
- `supabase/migrations/005_crud_soft_delete.sql`
- `src/lib/admin/queries.ts`
- `src/lib/actions/admin.ts`
- `src/lib/actions/auth.ts`
- `src/lib/auth/get-session-profile.ts`
- `src/lib/supabase/middleware.ts`
- `src/components/ui/DataTable.tsx`
- `src/components/ui/ConfirmDialog.tsx`
- `src/components/ui/FormField.tsx`
- `src/components/admin/ClientForm.tsx`
- `src/components/admin/ClientFilters.tsx`
- `src/components/admin/ClientRowActions.tsx`
- `src/app/admin/clientes/page.tsx`
- `src/app/admin/clientes/novo/page.tsx`
- `src/app/admin/clientes/[id]/page.tsx`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- `npm run build` aprovado com novas rotas de clientes.
- `supabase db push` aplicou a migration `005`.
- Validacao visual no browser em `http://localhost:3001/admin/clientes` confirmando:
  - filtros renderizados;
  - coluna `Acoes` presente;
  - links de edicao funcionando;
  - modal de exclusao abrindo;
  - ausencia de rolagem horizontal na pagina;
  - rolagem horizontal restrita ao container da tabela em viewport estreito.
- Validacao visual das telas:
  - `/admin/clientes/novo`
  - `/admin/clientes/[id]`

Nao foi possivel validar ainda:

- submissao real da exclusao logica ate o fim, para nao desativar cadastros existentes do ambiente.
- replicacao completa do mesmo CRUD em `Usuarios` e `Cotacoes`.

Proxima etapa recomendada:

- aplicar o mesmo padrao de CRUD de clientes em `Usuarios` e depois em `Cotacoes`, reaproveitando filtros, acoes por linha e modal de confirmacao.

### 2026-06-16 - Base dinamica inicial do painel administrativo

- Nova migration `004_admin_foundation.sql` criada e aplicada no Supabase remoto.
- O schema administrativo agora inclui:
  - coluna `source` em `clients` para diferenciar origem `site` e `admin`;
  - tabela `quotes` para historico persistido de cotacoes;
  - tabela `simulations` para o futuro modulo de simulacoes com arquivo;
  - indices e politicas RLS para leitura do proprio cliente e acesso total do admin.
- A migration tambem faz backfill do relacionamento entre `app_users` clientes antigos e `clients`, preenchendo `client_id` quando faltava.
- Cadastro publico em `/cadastro` passou a criar primeiro o registro em `clients` e depois o usuario da aplicacao em `app_users`, mantendo a base de clientes fora do provedor de auth.
- Sidebar administrativa reorganizada para a ordem aprovada:
  - Dashboard;
  - Clientes;
  - Cotações;
  - Simulações;
  - Usuários;
  - itens futuros em grupo `Em breve`: Fornecedores, Despachantes e Parâmetros.
- Dashboard administrativo passou a exibir totalizadores reais do banco:
  - clientes cadastrados;
  - usuarios admin ativos;
  - cotacoes recebidas;
  - pedidos de simulacao completa;
  - simulacoes publicadas.
- Tela `/admin/clientes` agora:
  - lista clientes vindos do site e do painel;
  - permite cadastrar cliente manualmente no admin.
- Tela `/admin/usuarios` agora:
  - lista usuarios administrativos;
  - permite criar novos admins com Supabase Auth + `app_users`.
- Tela `/admin/cotacoes` agora:
  - lista cotacoes persistidas;
  - deixa a base pronta para o futuro fluxo de pedido de simulacao completa.
- O servidor local antigo em `3001` estava com estado quebrado; ele foi reiniciado e a validacao passou na instancia nova.

Arquivos principais:

- `supabase/migrations/004_admin_foundation.sql`
- `src/lib/admin/queries.ts`
- `src/lib/actions/admin.ts`
- `src/lib/actions/auth.ts`
- `src/app/admin/layout.tsx`
- `src/components/layout/AppShell.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/clientes/page.tsx`
- `src/app/admin/cotacoes/page.tsx`
- `src/app/admin/usuarios/page.tsx`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- `npm run build` aprovado com as novas rotas administrativas.
- `supabase db push` aplicou a migration `004`.
- `supabase migration list` confirmou `001`, `002`, `003` e `004` em local/remoto.
- Validacao visual local em `http://localhost:3001` confirmando carregamento sem erro de:
  - `/admin/dashboard`
  - `/admin/clientes`
  - `/admin/cotacoes`
  - `/admin/usuarios`

Nao foi possivel validar ainda:

- Criacao real de cliente pelo painel com submissao completa do formulario.
- Criacao real de novo admin pelo painel com submissao completa do formulario.
- Persistencia real de cotacoes, porque o fluxo da calculadora ainda nao grava em `quotes`.
- Tela funcional de simulacoes com upload e publicacao de PDF.

Proxima etapa recomendada:

- Persistir as cotacoes da calculadora em `quotes` e adicionar o gatilho de `pedido de simulacao completa` na area do cliente, para alimentar naturalmente o painel administrativo.

### 2026-06-16 - Landing page comercial da home e revisão de textos em PT-BR

- A rota `/` foi substituída por uma landing page comercial focada em captação de leads para a calculadora.
- A nova home passou a comunicar a calculadora como porta de entrada e a Global RPX como autoridade operacional.
- Estrutura implementada na landing:
  - header com navegação;
  - hero com preview visual da calculadora;
  - faixa de autoridade;
  - dor do cliente;
  - como funciona;
  - o que o resultado apresenta;
  - simulação gratuita x análise completa;
  - para quem é;
  - bloco Canton Fair;
  - diferenciais da Global RPX;
  - depoimentos placeholder;
  - FAQ;
  - CTA final;
  - footer.
- CTAs principais ligados ao fluxo real atual:
  - `Calcular grátis` e equivalentes -> `/cadastro`
  - `Entrar` -> `/login`
- CTAs de contato e análise completa ficaram como placeholder neutro com `TODO`, sem inventar WhatsApp ou rota externa.
- SEO básico adicionado na home com title e meta description específicos.
- Textos visíveis das páginas principais foram revisados para Português Brasileiro com acentuação:
  - home;
  - login;
  - cadastro;
  - termos;
  - área do cliente;
  - páginas administrativas;
  - calculadora e histórico.

Arquivos principais:

- `src/app/page.tsx`
- `src/components/landing/HomeLanding.tsx`
- `src/app/layout.tsx`
- `src/app/login/page.tsx`
- `src/app/cadastro/page.tsx`
- `src/app/termos/page.tsx`
- `src/app/app/page.tsx`
- `src/app/app/layout.tsx`
- `src/app/app/calculadora/page.tsx`
- `src/app/app/simulacoes/page.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/cotacoes/page.tsx`
- `src/app/admin/fornecedores/page.tsx`
- `src/app/admin/usuarios/page.tsx`
- `src/app/admin/parametros/page.tsx`
- `src/app/admin/simulacoes/page.tsx`
- `src/components/calculator/CalculatorClient.tsx`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- `npm run build` aprovado com 19 rotas.
- Verificação local da home em `http://localhost:3001/` confirmando:
  - title SEO correto;
  - headline principal renderizada;
  - CTA principal para `/cadastro`;
  - CTA de login para `/login`.

Nao foi possivel validar ainda:

- Rotas finais de contato, politica de privacidade e solicitacao de analise, pois ainda nao existem no produto.
- Depoimentos reais da Global RPX, que permanecem como placeholder.

Proxima etapa recomendada:

- Definir o destino real dos CTAs comerciais de contato/analise e implementar as respectivas rotas ou integracoes.

### 2026-06-16 - Base de usuarios desacoplada em `app_users`

- Nova migration `003_app_users.sql` criada e aplicada no Supabase remoto.
- Tabela `app_users` criada como fonte de verdade da aplicacao para:
  - perfil;
  - role;
  - status;
  - vinculo com `client_id`;
  - aceite de termos;
  - identificador do provedor de autenticacao.
- Dados existentes de `profiles` migrados para `app_users`.
- Funcao `public.is_admin()` e politica de leitura de `clients` passaram a usar `app_users`.
- Trigger `on_auth_user_created_profile` e funcao `handle_new_user_profile()` removidos para parar de acoplar cadastro da app ao `auth.users`.
- `signInAction`, `signUpAction`, sessao e middleware passaram a consultar `app_users`.
- Novo helper server-side `src/lib/supabase/admin.ts` criado para operacoes com `SUPABASE_SERVICE_ROLE_KEY`.
- Cadastro publico agora:
  - cria usuario no provedor de auth;
  - grava o registro correspondente em `app_users`;
  - autentica o cliente e redireciona para `/app`.
- `agents.md` atualizado para exigir plano aprovado antes de implementar e para registrar `app_users` como base de usuarios da aplicacao.
- Documentacao de produto/fundacao atualizada para refletir `app_users` no modelo.

Arquivos principais:

- `src/lib/actions/auth.ts`
- `src/lib/auth/get-session-profile.ts`
- `src/lib/auth/mock-users.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/types.ts`
- `src/components/layout/AppShell.tsx`
- `src/app/app/layout.tsx`
- `src/app/admin/layout.tsx`
- `src/app/app/calculadora/page.tsx`
- `supabase/migrations/003_app_users.sql`
- `agents.md`
- `docs/visao-geral-produto.md`
- `docs/plano-fundacao-sistema.md`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- `npm run build` aprovado com 19 rotas.
- `supabase db push` aplicou a migration `003`.
- `supabase migration list` confirmou `001`, `002` e `003` em local/remoto.
- Fluxo visual real de cadastro em `http://localhost:3001/cadastro`:
  - criou usuario novo;
  - redirecionou para `/app`;
  - exibiu a area do cliente autenticada.
- Login real com o usuario recem-criado em `http://localhost:3001/login` redirecionou corretamente para `/app`.
- Consulta direta ao banco confirmou registro novo em `app_users` com `role=client`, `status=active`, `auth_provider=supabase` e `accepted_terms_at`.

Nao foi possivel validar ainda:

- Fluxo administrativo futuro de listagem, edicao e exportacao de `app_users`, porque essas telas ainda nao foram implementadas.

Proxima etapa recomendada:

- Criar a estrutura administrativa de clientes/usuarios usando `app_users` como base da aplicacao e deixar `profiles` apenas como legado temporario ate a limpeza definitiva do esquema.

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
- `vercel.json` atualizado com `git.deploymentEnabled: false` para evitar deploy automatico por push.

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
- `vercel.json`
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
- A Vercel disparou um build automatico apos o push mesmo com `[skip ci]`; a configuracao oficial para bloquear proximos deploys foi adicionada em `vercel.json`.

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
