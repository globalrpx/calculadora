# Plano de Migracao - Simulacoes Finais

Data: 2026-07-09

## 1. Visao geral

O projeto fonte da verdade e este repositorio atual em `/Users/hugoferreira/htdocs/app-rpx`.

A pasta `temp/` e uma referencia temporaria de analise. Ela contem documentacao, codigo, migrations, componentes, actions, rotas, types, schemas, dados demo e especificacoes de uma implementacao anterior do modulo de Simulacoes Finais feita pelo Rodrigo.

O objetivo da migracao e trazer o conhecimento funcional e tecnico do modulo anterior para a arquitetura atual da Calculadora RPX, preservando os contratos ja consolidados neste projeto:

- Next.js App Router;
- Supabase Auth;
- `app_users` como fonte de verdade de usuario, role, status e `client_id`;
- RLS baseada em `app_users`;
- uploads via tabela unica `uploads` e bucket privado `app-uploads`;
- padrao administrativo documentado em `docs/spec-cruds.md`;
- calculadora, cotacoes e simulacoes basicas ja persistidas em `quotes` e `simulations`.

Nada de `temp/` deve ser copiado cegamente. Especialmente nao devem ser copiados diretamente:

- migrations antigas;
- referencias a `profiles` como fonte principal;
- policies RLS baseadas no modelo antigo;
- bucket `simulation-documents` sem reconciliar com `app-uploads`;
- rotas e layouts que criem um padrao paralelo ao admin atual;
- demo local com `localStorage` como base de produto;
- codigo que exponha campos internos ao cliente;
- calculos fiscais sem validacao das perguntas abertas.

## 2. Inventario do projeto atual

### Stack detectada

- Next.js 15 com App Router.
- React 19.
- TypeScript.
- Tailwind CSS.
- Supabase JS e Supabase SSR.
- Supabase Auth, Postgres e Storage.
- Vercel como alvo de deploy.
- `browser-image-compression` ja instalado para uploads da calculadora.

Scripts atuais:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`

### Rotas existentes

Publicas e conta:

- `/`
- `/login`
- `/cadastro`
- `/termos`
- `/privacidade`
- `/logout`
- `/conta`

Cliente:

- `/app`
- `/app/calculadora`
- `/app/simulacoes`

Admin:

- `/admin`
- `/admin/dashboard`
- `/admin/clientes`
- `/admin/clientes/novo`
- `/admin/clientes/[id]`
- `/admin/cotacoes`
- `/admin/cotacoes/[id]`
- `/admin/simulacoes`
- `/admin/simulacoes/nova`
- `/admin/simulacoes/[id]`
- `/admin/configuracoes`
- `/admin/usuarios`
- `/admin/usuarios/novo`
- `/admin/usuarios/[id]`
- `/admin/fornecedores`
- `/admin/despachantes`
- `/admin/parametros`

API:

- `/api/exchange-rate`

### Layout admin existente

O admin usa `src/app/admin/layout.tsx`, `requireRole("admin")`, `AppShell` e `adminNavItems` em `src/lib/navigation.ts`.

Itens atuais do menu admin:

- Dashboard;
- Clientes;
- Cotacoes;
- Simulacoes;
- Configuracoes;
- Usuarios.

O padrao visual atual e o de CRUDs operacionais, com header, filtros, totalizador, tabela, paginacao, badges e acoes por linha quando aplicavel.

### Autenticacao e permissoes existentes

O fluxo atual usa:

- `src/lib/auth/get-session-profile.ts`;
- Supabase Auth;
- fallback mock por cookie apenas quando Supabase nao esta configurado;
- `app_users` como fonte de verdade da aplicacao.

Regras atuais:

- `admin` acessa `/admin`;
- `client` acessa `/app`;
- usuarios inativos ou com `deleted_at` sao bloqueados;
- `profiles` existe como legado e nao deve orientar novas implementacoes;
- Service role apenas server-side;
- UI nao substitui RLS nem validacao server-side.

### Padrao de Supabase e migrations

Migrations atuais:

- `001_foundation.sql`;
- `002_public_signup_profiles.sql`;
- `003_app_users.sql`;
- `004_admin_foundation.sql`;
- `005_crud_soft_delete.sql`;
- `006_client_quotes_persistence.sql`;
- `20260709134047_create_uploads_table_and_storage_bucket.sql`;
- `20260709180000_create_config_table.sql`.

Tabelas principais atuais:

- `clients`;
- `app_users`;
- `profiles` legado;
- `quotes`;
- `simulations`;
- `uploads`;
- `config`.

Padroes importantes:

- criar migrations incrementais novas;
- nao editar migrations ja aplicadas;
- usar `numeric` para valores monetarios e taxas;
- toda tabela de negocio de cliente deve ter `client_id`;
- RLS deve isolar cliente por `client_id`;
- `is_admin()` atual consulta `app_users`;
- uploads devem usar FK explicita no modulo e tabela `uploads`, evitando `owner_type`/`owner_id`.

### Padrao de server actions e queries

Padrao atual:

- paginas administrativas principais como Server Components;
- Server Actions em `src/lib/actions/*`;
- queries administrativas em `src/lib/admin/queries.ts`;
- validacao server-side como fonte de verdade;
- retorno estruturado para formularios com `fieldErrors`, `values` e `message` nos CRUDs mais completos;
- helpers Supabase em `src/lib/supabase/server.ts` e `src/lib/supabase/admin.ts`;
- validacao de role no servidor antes de operacoes sensiveis.

### Componentes UI reutilizaveis

Componentes atuais relevantes:

- `AppShell`;
- `PageHeader`;
- `CrudHeaderWithFilters`;
- `Button` e `ButtonLink`;
- `Card`;
- `ConfirmDialog`;
- `DataTable`;
- `DismissibleAlert`;
- `EmptyState`;
- `FormField`, `TextInput`, `NumberInput`;
- `StatusBadge`;
- `UploadsCard`;
- `UploadFilesCell`;
- `TablePlaceholder`.

### Convencoes de pastas

Estrutura atual:

- `src/app`: rotas do App Router;
- `src/components`: componentes reutilizaveis e por dominio;
- `src/lib`: actions, queries, auth, Supabase, calculos e helpers;
- `supabase/migrations`: SQL incremental;
- `docs`: documentacao viva;
- `data` e `public/data`: base NCM da calculadora;
- `state.md`: memoria operacional.

O projeto atual nao usa `src/features` como padrao principal, embora essa organizacao possa ser considerada se o modulo crescer e for aprovada.

## 3. Inventario da implementacao do Rodrigo em temp/

### Arquivos encontrados

Documentacao em `temp/docs/`:

- `NARWAL_MAPPING.md`;
- `FINAL_SIMULATIONS_SPEC.md`;
- `CALCULATION_RULES.md`;
- `EXPENSES_ENGINE.md`;
- `FISCAL_PARAMETRIZATION.md`;
- `NCM_INTEGRATION.md`;
- `IMPLEMENTATION_PLAN.md`;
- `OPEN_QUESTIONS.md`;
- `RODRIGO_IMPLEMENTATION_AUDIT.md`;
- alem de docs gerais de produto, banco, auth, rotas, stack, UI e status.

Codigo principal:

- `temp/src/features/final-simulations/actions.ts`;
- `temp/src/features/final-simulations/calculation-engine.ts`;
- `temp/src/features/final-simulations/components.tsx`;
- `temp/src/features/final-simulations/demo-components.tsx`;
- `temp/src/features/final-simulations/demo-data.ts`;
- `temp/src/features/final-simulations/document-generator.ts`;
- `temp/src/features/final-simulations/encomenda-components.tsx`;
- `temp/src/features/final-simulations/expense-components.tsx`;
- `temp/src/features/final-simulations/expense-engine.ts`;
- `temp/src/features/final-simulations/fiscal-components.tsx`;
- `temp/src/features/final-simulations/queries.ts`;
- `temp/src/features/final-simulations/schemas.ts`;
- `temp/src/features/final-simulations/types.ts`.

Rotas em `temp/src/app/`:

- `/admin/simulacoes-finais`;
- `/admin/simulacoes-finais/nova`;
- `/admin/simulacoes-finais/[id]`;
- `/admin/simulacoes-finais/[id]/editar`;
- `/admin/cadastros/tipos-despesa`;
- `/admin/cadastros/tipos-despesa/novo`;
- `/admin/cadastros/pre-calculos-despesas`;
- `/admin/cadastros/pre-calculos-despesas/novo`;
- `/admin/cadastros/parametrizacoes-fiscais`;
- `/admin/cadastros/parametrizacoes-fiscais/novo`;
- `/api/final-simulations-demo/document`.

Migrations em `temp/supabase/migrations/`:

- `001_foundation.sql`;
- `002_final_simulations.sql`;
- `003_final_simulation_item_ncm_validation.sql`;
- `004_final_simulation_fiscal_commission.sql`;
- `005_final_simulation_encomenda_taxes.sql`;
- `006_final_simulation_documents_generation.sql`.

Assets especificos:

- `temp/public/logo-global-rpx-pdf.png`;
- `temp/public/logo-global-rpx-pdf.jpg`.

### Rotas implementadas

O fluxo de `temp/` implementa uma area paralela em `/admin/simulacoes-finais`, com listagem, criacao, detalhe, edicao por abas, cadastros de apoio e API demo de documentos.

A rota antiga `/admin/simulacoes` em `temp/` foi tratada como ponte para Simulacoes Finais. No projeto atual, `/admin/simulacoes` ja existe e opera sobre a tabela atual `simulations`, com detalhe e uploads.

### Componentes implementados

O Rodrigo implementou componentes para:

- formulario de dados principais;
- produtos;
- despesas;
- tipos de despesa;
- presets/pre-calculos;
- parametrizacoes fiscais;
- impostos de encomenda;
- demo local completa;
- labels de status, modalidade, via, despesas e fiscal.

Parte dos componentes usa os componentes UI basicos do projeto antigo, mas nao segue integralmente o padrao CRUD atual do modulo Clientes.

### Migrations existentes

A migration principal `002_final_simulations.sql` cria enums, tabelas, indices, triggers, RLS e policies para o modulo.

Migrations posteriores adicionam:

- validacao RPX de NCM por item;
- forma de cobranca da comissao;
- snapshot textual de UF de revenda;
- campos e bucket para documentos gerados.

Essas migrations dependem de `profiles` e de funcoes antigas como `current_client_id()` baseada em `profiles`.

### Tabelas existentes em temp/

Principais tabelas planejadas/criadas:

- `states`;
- `ncm_codes`;
- `ncm_tax_profiles`;
- `invoice_parametrizations`;
- `expense_types`;
- `expense_presets`;
- `expense_preset_items`;
- `final_simulations`;
- `final_simulation_items`;
- `simulation_tax_lines`;
- `simulation_expense_lines`;
- `simulation_versions`;
- `simulation_documents`;
- `simulation_encomenda_taxes`.

### Types, schemas e actions

`types.ts` define enums e tipos de dominio amplos.

`schemas.ts` usa validacao manual, sem biblioteca externa.

`actions.ts` implementa actions para:

- criar e editar simulacao;
- duplicar simulacao;
- criar/editar/remover produtos;
- cadastrar tipos de despesa;
- cadastrar presets;
- processar pre-calculo;
- adicionar despesa manual;
- cadastrar parametrizacao fiscal;
- atualizar fiscal;
- atualizar impostos de encomenda;
- recalcular snapshot;
- gerar PDF cliente e relatorio interno;
- criar versao.

Essas actions precisam ser adaptadas para o padrao atual de `app_users`, mensagens de formulario e permissao server-side.

### Motor de calculo

`calculation-engine.ts` centraliza um motor v1 com:

- calculo por item;
- seguro;
- frete;
- CIF/valor aduaneiro;
- impostos por item;
- despesas e rateios;
- encomenda;
- consolidado;
- snapshot com `formulaVersion`.

O motor e uma boa referencia tecnica, mas as formulas fiscais ainda dependem das perguntas abertas e nao devem ser tratadas como regra final.

### PDF/Excel

`document-generator.ts` gera:

- `client_pdf`;
- `internal_detailed_report`.

Nao ha XLSX final implementado. A memoria de Excel aparece como referencia futura/documental.

O gerador PDF e manual, sem dependencia externa nova, e usa assets especificos de logo em `temp/public`.

### Cadastros implementados

Foram implementados cadastros iniciais para:

- tipos de despesa;
- pre-calculos de despesa;
- parametrizacoes fiscais de NF Entrada/Saida.

Nao foram encontrados seeds consistentes para popular estados, NCM, perfis tributarios, tipos, presets ou parametrizacoes.

### Mocks e dados hardcoded

Existem dados demo em:

- `demo-data.ts`;
- `demo-components.tsx`;
- API `/api/final-simulations-demo/document`;
- localStorage com chave `global-rpx-final-simulation-demo`.

Tambem ha dados demo MOBITA e preset PORTO em codigo.

Esses dados devem servir apenas como referencia de comportamento e testes manuais, nao como seed de producao.

### Dependencias no package.json de temp/

O `temp/package.json` tem as mesmas dependencias principais do projeto antigo, sem `browser-image-compression`.

Nao ha dependencia especifica nova para PDF/Excel. O projeto atual tem `browser-image-compression`, que nao existe em `temp/`.

## 4. Comparacao entre especificacao Narwal e implementacao Rodrigo

| Area | Existe na especificacao? | Existe no projeto atual? | Existe em temp? | Status | Recomendacao |
|---|---|---|---|---|---|
| Lista de simulacoes finais | Sim | Parcial, via `/admin/simulacoes` basica | Sim, `/admin/simulacoes-finais` | Parcial em temp | Adaptar para o admin atual, sem substituir `/admin/simulacoes` sem decisao |
| Criacao/dados principais | Sim | Simulacao basica em `simulations` | Sim, `final_simulations` | Parcial em temp | Reimplementar sobre modelo revisado |
| Valores da operacao | Sim | Ausente para simulacao final | Modelo/types em temp, UI real incompleta | Parcial | Reimplementar depois de validar formulas |
| Produtos | Sim | Ausente em simulacao final | Sim, itens e UI | Parcial | Adaptar types e regras, reimplementar UI |
| NCM/base Receita/Classif | Sim | JSON local da calculadora | Base/tabelas planejadas em temp | Parcial | Reaproveitar conceito; criar carga no banco em fase propria |
| Impostos | Sim | Ausente para simulacao final | Estrutura e motor v1 | Parcial | Reimplementar com validacao fiscal antes |
| Parametrizacao fiscal NF entrada/saida | Sim | Ausente | Sim, cadastro e selecao | Parcial | Adaptar cadastro ao padrao CRUD atual |
| Despesas | Sim | Ausente | Sim, linhas e componentes | Parcial | Reaproveitar conceitos e enums; revisar regras |
| Tipos de despesa | Sim | Ausente | Sim | Parcial | Adaptar CRUD ao padrao atual |
| Pre-calculos de despesas | Sim | Ausente | Sim | Parcial | Adaptar com regra anti-duplicacao aprovada |
| Impostos encomenda | Sim | Ausente | Sim | Parcial | Manter fora da primeira fase funcional se formulas nao forem confirmadas |
| Estados/UF ativos | Sim | Ausente como tabela | Sim, `states` | Parcial | Criar tabela revisada com seed controlado |
| Calculo final | Sim | Ausente para simulacao final | Motor v1 | Parcial | Usar como referencia, escrever testes e validar formulas |
| Snapshot/versionamento | Sim | Ausente no modelo atual de `simulations` | Sim, mas incompleto | Parcial | Reimplementar como contrato central |
| PDF cliente | Sim | Upload de arquivos existe, PDF nao | Sim | Parcial | Adaptar depois de snapshot aprovado |
| Relatorio interno detalhado | Sim | Ausente | Sim | Parcial | Reaproveitar gerador conceitualmente |
| Permissoes/RLS | Sim | Sim, padrao atual com `app_users` | Sim, mas baseado em `profiles` | Incompativel | Reescrever RLS para `app_users` |
| Uploads/documentos | Sim | Sim, `uploads` + `app-uploads` | Sim, `simulation_documents` + `simulation-documents` | Divergente | Integrar ao padrao atual de uploads |
| Duplicacao de simulacao | Sim | Ausente para final | Sim | Parcial | Adaptar depois do modelo aprovado |
| Status/aprovacao | Sim | Status basico em `simulations` | Status final e bloqueio parcial | Parcial | Reimplementar transicoes com Server Actions e RLS |

## 5. Diferencas criticas

### Projeto atual versus temp/

- Projeto atual usa `app_users`; `temp/` ainda depende de `profiles`.
- Projeto atual ja tem `quotes`, `simulations`, `uploads` e `config`; `temp/` cria um mundo paralelo com `final_simulations` e `simulation_documents`.
- Projeto atual tem bucket privado `app-uploads`; `temp/` usa bucket `simulation-documents`.
- Projeto atual tem CRUDs admin padronizados; `temp/` tem telas funcionais, mas com filtros/formularios menos alinhados ao padrao atual.
- Projeto atual tem upload real unificado; `temp/` usa uma tabela especifica de documentos.
- Projeto atual tem `config.import_factor`; `temp/` nao contempla essa configuracao da calculadora atual.
- Projeto atual ja exclui `temp` do typecheck; `temp/` nao pertence ao app principal.

### Especificacao Narwal versus temp/

- A especificacao pede fluxo completo de aprovacao/publicacao; `temp/` implementa bloqueios parciais, mas nao o ciclo completo de revisao, aprovacao e publicacao ao cliente.
- A especificacao pede versionamento em toda alteracao relevante; `temp/` tem `simulation_versions`, mas nao aciona versao automaticamente em todos os pontos.
- A especificacao contempla Valores da Operacao como tela/etapa; `temp/` tem modelo e demo, mas UI Supabase real incompleta.
- A especificacao pede area cliente para simulacoes publicadas; `temp/` nao implementa o detalhe real do cliente para Simulacoes Finais.
- A especificacao cita referencia Receita/Classif; `temp/` planeja base local, mas nao implementa integracao externa.
- A especificacao deixa varias formulas em aberto; `temp/` implementa motor v1 que ainda precisa validacao fiscal.

### Nomes de tabelas, campos e enums

Risco de conflito ou decisao:

- `simulations` atual versus `final_simulations` de `temp/`;
- `uploads` atual versus `simulation_documents` de `temp/`;
- `app_users.id` atual versus FKs para `profiles.id` em `temp/`;
- status atual de `simulations`: `draft`, `aguardando`, `em_producao`, `published`, `finalizado`, `cancelado`;
- status de `final_simulations`: `draft`, `in_review`, `needs_adjustment`, `approved`, `sent_to_customer`, `archived`.

### Rotas

Rotas atuais:

- `/admin/simulacoes`;
- `/admin/simulacoes/nova`;
- `/admin/simulacoes/[id]`;
- `/app/simulacoes`.

Rotas de `temp/`:

- `/admin/simulacoes-finais`;
- `/admin/simulacoes-finais/nova`;
- `/admin/simulacoes-finais/[id]`;
- `/admin/simulacoes-finais/[id]/editar`;
- `/admin/cadastros/*`.

Decisao pendente: manter Simulacoes Finais como modulo separado em `/admin/simulacoes-finais` ou evoluir `/admin/simulacoes` para o novo fluxo.

### Padroes de codigo

- Atual: `src/lib/admin/queries.ts`, `src/lib/actions/admin.ts`, componentes em `src/components/admin`.
- Temp: feature folder `src/features/final-simulations`.

Uma pasta de dominio pode ser aceitavel pelo tamanho do modulo, mas precisa decisao explicita para nao criar arquitetura paralela inconsistente.

### Dependencias

Nao ha dependencias adicionais relevantes em `temp/`. O gerador PDF e manual. A migracao nao exige instalacao imediata de pacotes.

### Regras de calculo

O motor de `temp/` e util, mas nao deve ser tratado como definitivo porque seguem abertas formulas de:

- II;
- IPI;
- PIS;
- COFINS;
- ICMS;
- antidumping;
- frete collect/prepaid;
- seguro;
- creditos tributarios;
- comissao;
- despesas por comportamento fiscal;
- arredondamento.

## 6. Riscos de migracao

| Risco | Nivel | Motivo | Mitigacao |
|---|---|---|---|
| Quebrar autenticacao | Alto | `temp/` usa `profiles`; atual usa `app_users` | Reescrever actions/RLS para `app_users` |
| Quebrar RLS | Alto | Policies antigas consultam `profiles` e `current_client_id()` antigo | Criar policies novas e testar admin + dois clientes |
| Duplicar tabelas | Alto | `simulations` atual e `final_simulations` podem se sobrepor | Decidir fronteira e nomenclatura antes da migration |
| Conflito de migrations | Alto | Numeracao e fundacao de `temp/` nao batem com banco atual | Criar migration incremental nova, nunca aplicar temp diretamente |
| Calculo errado | Alto | Formulas fiscais e arredondamentos ainda nao confirmados | Validar perguntas abertas e criar testes de motor |
| Copiar codigo antigo incompativel | Alto | Imports, auth, storage e rotas diferem | Reaproveitar por adaptacao, nao por copia |
| Dependencias desnecessarias | Baixo | Temp nao introduz novas libs relevantes | Manter sem instalacao ate necessidade real |
| Expor campos internos ao cliente | Alto | PDF e detalhe cliente exigem filtragem forte | Criar DTO publico e snapshot visivel separado |
| Perder padrao de CRUD | Medio | Telas de temp nao seguem 100% o padrao atual | Reimplementar UI com `docs/spec-cruds.md` |
| Storage fragmentado | Medio | Temp usa bucket proprio | Integrar com `uploads` e `app-uploads` ou justificar excecao |
| Performance de listagens | Medio | Filtros por NCM podem depender de tabelas filhas | Planejar indices e queries paginadas |
| Falta de seed | Medio | Temp nao tem seeds dos cadastros base | Criar fase propria de seeds aprovados |

## 7. Estrategia recomendada

### Reaproveitar conceitualmente

- Mapeamento Narwal.
- Estrutura funcional por fases.
- Modelo conceitual de tabelas de Simulacoes Finais.
- Estados/status de revisao e aprovacao.
- Necessidade de snapshots.
- Separacao PDF cliente versus relatorio interno.
- Motor centralizado.
- Cadastros de tipos de despesa, pre-calculos e parametrizacoes fiscais.
- Validacao RPX de NCM.

### Copiar com adaptacao cuidadosa

Nenhum arquivo deve ser copiado literalmente nesta etapa. Em fases futuras, podem ser portados trechos com adaptacao:

- tipos/enums de dominio;
- labels;
- parsers manuais, se alinhados ao padrao de formularios atual;
- funcoes puras do motor de calculo apos validacao;
- ideias do gerador PDF;
- helpers de despesas;
- estrutura de snapshot.

### Refazer do zero

- migrations;
- RLS;
- FKs de usuario;
- Storage/policies;
- rotas administrativas finais;
- formulários no padrao CRUD atual;
- actions com permissao server-side atual;
- queries paginadas/filtros no padrao atual;
- area cliente publicada;
- fluxo de aprovacao/publicacao;
- download por signed URL integrado ao padrao atual.

### Descartar

- `temp/001_foundation.sql`;
- referencias a `profiles` como fonte principal;
- demo local como fluxo do produto;
- localStorage de Simulacao Final;
- ponte que substitui `/admin/simulacoes` sem decisao de produto;
- bucket `simulation-documents` se nao houver justificativa para separar do padrao `app-uploads`;
- mocks MOBITA/PORTO como seed produtivo.

### Fora da V1

- integracao real Receita/Classif;
- OCR;
- importacao Excel;
- geracao XLSX;
- RBAC granular de revisor/aprovador;
- auditoria completa de campo a campo;
- multi-filial sofisticado;
- formulas fiscais nao validadas;
- reabertura complexa apos aprovacao;
- notificacoes ao cliente.

## 8. Plano de implementacao em fases

### Fase 0 - Preparacao

- Revisar este plano com o usuario.
- Confirmar se Simulacoes Finais sera modulo separado ou evolucao de `/admin/simulacoes`.
- Confirmar nomes finais de tabelas e status.
- Confirmar quais docs de `temp/docs/` devem ser incorporados ao projeto atual.
- Fechar divergencias principais antes de banco.

Validacoes:

- revisao documental;
- nenhum codigo alterado;
- nenhuma migration criada.

### Fase 1 - Migrations

- Criar migration incremental no projeto atual.
- Definir tabelas principais.
- Definir enums ou check constraints.
- Criar indices.
- Criar RLS compativel com `app_users`.
- Integrar documentos com `uploads`/`app-uploads` ou justificar tabela/bucket proprio.
- Atualizar `docs/DATABASE_MODEL.md`.

Validacoes:

- `npm run typecheck`;
- `npm run lint`;
- aplicar migration em ambiente dev;
- testar policies com admin e dois clientes.

### Fase 2 - Types/schemas/actions

- Criar tipos de dominio revisados.
- Criar parsers/validacoes.
- Criar camada server-side de queries.
- Criar Server Actions iniciais.
- Validar permissao admin no servidor.
- Implementar primeiro calculo minimo apenas se formulas aprovadas para esta fase.

Validacoes:

- typecheck;
- lint;
- testes unitarios de funcoes puras quando houver motor.

### Fase 3 - UI base

- Implementar listagem administrativa.
- Implementar criacao de dados principais.
- Implementar edicao de dados principais.
- Seguir `docs/spec-cruds.md`.
- Usar filtros ocultaveis, tabela com rolagem interna e status badge.

Validacoes:

- typecheck;
- lint;
- teste manual admin de criar/listar/editar.

### Fase 4 - Produtos + NCM

- Implementar produtos da simulacao.
- Criar/usar base local NCM no banco.
- Implementar autocomplete por codigo/descricao.
- Salvar snapshots de NCM e aliquotas.
- Permitir validacao RPX.

Validacoes:

- buscar NCM por codigo e descricao;
- salvar produto;
- confirmar snapshot;
- impedir produto incompleto.

### Fase 5 - Despesas

- Implementar tipos de despesa.
- Implementar pre-calculos.
- Implementar processar pre-calculo.
- Implementar despesas manuais.
- Evitar duplicacao automatica de preset.

Validacoes:

- criar tipo;
- criar preset;
- processar preset;
- tentar reprocessar;
- adicionar despesa manual.

### Fase 6 - Fiscal

- Implementar parametrizacoes NF Entrada/Saida.
- Implementar creditos tributarios.
- Implementar comissao.
- Salvar snapshots fiscais.

Validacoes:

- cadastrar parametrizacao;
- selecionar entrada e saida;
- salvar creditos;
- confirmar que cliente nao ve dados internos.

### Fase 7 - Encomenda

- Implementar estado de revenda.
- Implementar impostos encomenda por produto.
- Habilitar apenas quando modalidade for `encomenda`.

Validacoes:

- alternar modalidade;
- preencher parametros por produto;
- salvar snapshot de UF e parametros.

### Fase 8 - Calculo final

- Implementar motor centralizado.
- Calcular por produto.
- Consolidar totais.
- Aplicar despesas, impostos e encomenda conforme formulas aprovadas.
- Salvar snapshot/versionamento.

Validacoes:

- testes unitarios com um produto;
- testes com multiplos produtos;
- teste de rateio;
- teste de arredondamento;
- conferencia manual com memoria RPX.

### Fase 9 - Documentos

- Gerar PDF cliente a partir de snapshot aprovado.
- Gerar relatorio interno detalhado.
- Registrar documentos em `uploads` ou tabela aprovada.
- Usar Supabase Storage privado.
- Publicar ao cliente apenas campos permitidos.

Validacoes:

- aprovar simulacao;
- gerar PDF;
- baixar como admin;
- acessar como cliente;
- confirmar que campos internos nao aparecem.

## 9. Arquivos candidatos a reaproveitamento

| Arquivo em temp/ | Funcao | Qualidade aparente | Recomendacao | Destino provavel | Observacoes |
|---|---|---|---|---|---|
| `temp/docs/NARWAL_MAPPING.md` | Mapeamento funcional | Alta | Reaproveitar conteudo conceitual | `docs/NARWAL_MAPPING.md` futuro | Adaptar ao estado atual |
| `temp/docs/FINAL_SIMULATIONS_SPEC.md` | Spec funcional | Alta | Reaproveitar com revisao | `docs/FINAL_SIMULATIONS_SPEC.md` futuro | Bom ponto de partida |
| `temp/docs/CALCULATION_RULES.md` | Regras de calculo | Media | Reaproveitar como pendente de validacao | `docs/CALCULATION_RULES.md` futuro | Nao tratar como formula final |
| `temp/docs/EXPENSES_ENGINE.md` | Despesas | Alta | Reaproveitar conceitualmente | `docs/EXPENSES_ENGINE.md` futuro | Precisa validar comportamentos |
| `temp/docs/FISCAL_PARAMETRIZATION.md` | Fiscal | Alta | Reaproveitar conceitualmente | `docs/FISCAL_PARAMETRIZATION.md` futuro | Sensivel |
| `temp/docs/NCM_INTEGRATION.md` | NCM | Alta | Reaproveitar conceitualmente | `docs/NCM_INTEGRATION.md` futuro | Integrar com base atual |
| `temp/docs/OPEN_QUESTIONS.md` | Perguntas abertas | Alta | Adaptar para projeto atual | `docs/OPEN_QUESTIONS.md` | Criado nesta etapa |
| `temp/docs/RODRIGO_IMPLEMENTATION_AUDIT.md` | Auditoria antiga | Alta | Usar como referencia | Nao copiar integralmente agora | Caminhos antigos citam Rodrigo |
| `temp/src/features/final-simulations/types.ts` | Tipos/enums | Media/Alta | Adaptar | `src/lib/final-simulations/types.ts` ou feature futura | Trocar FKs/contratos |
| `temp/src/features/final-simulations/schemas.ts` | Validacao manual | Media | Adaptar parcialmente | actions/schemas futuros | Alinhar a formulario atual |
| `temp/src/features/final-simulations/calculation-engine.ts` | Motor de calculo | Media | Adaptar apos validacao | `src/lib/final-simulations/calculation-engine.ts` futuro | Criar testes antes |
| `temp/src/features/final-simulations/expense-engine.ts` | Helpers de despesas | Media/Alta | Adaptar | modulo de despesas futuro | Bom material de dominio |
| `temp/src/features/final-simulations/document-generator.ts` | PDF cliente/interno | Media | Adaptar depois de snapshots | modulo de documentos futuro | Revisar exposicao cliente |
| `temp/src/features/final-simulations/queries.ts` | Queries Supabase | Media | Reimplementar usando partes | queries futuras | Incompativel com auth/storage atuais |
| `temp/src/features/final-simulations/actions.ts` | Server Actions | Media | Reimplementar usando partes | actions futuras | Precisa `app_users`, fieldErrors e permissoes |
| `temp/src/features/final-simulations/components.tsx` | UI principal | Media | Reimplementar visualmente | `src/components/admin/*` ou feature futura | Seguir spec CRUD atual |
| `temp/src/features/final-simulations/expense-components.tsx` | UI despesas | Media | Reimplementar | componentes admin futuros | Ajustar filtros/formularios |
| `temp/src/features/final-simulations/fiscal-components.tsx` | UI fiscal | Media | Reimplementar | componentes admin futuros | Sensivel |
| `temp/src/features/final-simulations/encomenda-components.tsx` | UI encomenda | Media | Adaptar | fase encomenda | Fora da V1 se formulas abertas |
| `temp/public/logo-global-rpx-pdf.*` | Logo PDF | Media | Avaliar uso futuro | `public/` se aprovado | Nao copiar agora |

## 10. Arquivos que nao devem ser reaproveitados diretamente

Nao reaproveitar diretamente:

- `temp/supabase/migrations/001_foundation.sql`: duplica fundacao antiga e usa `profiles`.
- `temp/supabase/migrations/002_final_simulations.sql`: ampla demais para aplicar diretamente, baseada em `profiles` e Storage proprio.
- `temp/supabase/migrations/003_final_simulation_item_ncm_validation.sql`: FK para `profiles`.
- `temp/supabase/migrations/004_final_simulation_fiscal_commission.sql`: depende da tabela antiga sem revisao.
- `temp/supabase/migrations/005_final_simulation_encomenda_taxes.sql`: depende da migration antiga.
- `temp/supabase/migrations/006_final_simulation_documents_generation.sql`: cria bucket `simulation-documents` e policies fora do padrao atual.
- `temp/src/features/final-simulations/demo-components.tsx`: demo local com `localStorage`, nao produto.
- `temp/src/features/final-simulations/demo-data.ts`: dados hardcoded MOBITA/PORTO.
- `temp/src/app/api/final-simulations-demo/document/route.ts`: API demo sem persistencia real.
- `temp/src/app/admin/layout.tsx`: altera menu/layout admin antigo.
- `temp/src/app/admin/simulacoes/page.tsx`: substitui rota antiga por ponte, conflita com fluxo atual.
- `temp/src/lib/auth/*`: auth antigo, inferior ao projeto atual.
- `temp/src/lib/supabase/*`: helpers antigos; manter os atuais.
- `temp/package.json`: nao deve substituir o package atual.
- `temp/tsconfig.json`: nao deve substituir o tsconfig atual.
- `temp/vercel.json`: nao deve substituir config atual.

## 11. Perguntas em aberto

As perguntas abertas consolidadas foram registradas em `docs/OPEN_QUESTIONS.md`.

As decisoes mais urgentes antes de qualquer migration sao:

- Simulacoes Finais sera uma tabela nova `final_simulations` ou evolucao de `simulations`?
- A rota final sera `/admin/simulacoes-finais` ou `/admin/simulacoes`?
- Documentos finais usam `uploads` + `app-uploads` ou uma tabela/bucket especifico?
- Quais status finais sao obrigatorios na V1?
- Quais formulas fiscais estao aprovadas para implementacao?
- Quais campos podem aparecer no PDF cliente?
- Quem aprova e quem publica simulacoes finais?

## 12. Atualizacao do state.md

`state.md` foi atualizado nesta entrega para registrar:

- `temp/` como referencia temporaria;
- `temp/` nao e fonte da verdade;
- o plano de migracao foi criado;
- a proxima etapa recomendada e revisar e aprovar as decisoes de Fase 0 antes de qualquer migration ou codigo.
