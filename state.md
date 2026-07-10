# State - Plataforma Global RPX

Ultima atualizacao: 2026-07-10

## Como usar este arquivo

Este arquivo e a memoria operacional do projeto. Ao terminar cada versao, funcionalidade ou bloco relevante de trabalho, atualizar:

- Status atual.
- O que foi entregue.
- O que ficou pendente.
- Decisoes tecnicas e de produto.
- Proxima etapa recomendada.

Antes de iniciar uma nova sessao, ler este arquivo junto com `AGENTS.md` e os documentos em `docs/`.

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

Estado: fundacao implementada, calculadora dinamica persistindo cotacoes reais em `quotes`, pedidos de simulacao completa persistindo em `simulations`, autenticacao real funcionando, base de usuarios da aplicacao desacoplada do provedor via `app_users` e modulo administrativo inicial conectado ao banco para dashboard, clientes, cotacoes, simulacoes e usuarios.
Storage administrativo iniciado com bucket privado `app-uploads`, tabela unica `uploads` e upload real de multiplos arquivos no detalhe de simulacao.
Configuracao administrativa inicial criada em `config`, com `import_factor` controlando o fator RPX usado em novas cotacoes e snapshot salvo em `quotes.rpx_factor`.

Servidor de preview atual:

```text
http://127.0.0.1:3001
```

Observacao: o preview em `scripts/preview-server.mjs` continua disponivel. As dependencias do app Next agora estao instaladas e o build passou; o ambiente ainda nao possui npm convencional no PATH, entao a estabilizacao usou um npm temporario.

## Entregue ate agora

### 2026-07-10 - Organizacao visual da sidebar admin

- Reorganizada a navegacao lateral administrativa em tres grupos visuais:
  - `Painel Administrativo`: Dashboard, Clientes, Cotacoes, Simulacoes;
  - `Back Office`: Simulacoes Finais, Tipos de Despesa, Pre-calculos, Parametrizacoes Fiscais;
  - `Gerenciar`: Configuracoes, Usuarios.
- Mantidas as mesmas rotas, textos dos links, permisssões, comportamento de item ativo e drawer mobile.
- A lista plana `adminNavItems` foi preservada para compatibilidade; o layout admin passa a usar `adminNavGroups` apenas para renderizacao agrupada.
- Atualizado `docs/UI_UX_GUIDE.md` com o padrao de agrupamento da sidebar admin.
- Nao houve alteracao em banco, migrations, auth, middleware, calculo, `package.json`, Simulacoes Finais alem do link de menu, producao ou `temp/`.

Arquivos principais:

- `src/lib/navigation.ts`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/app/admin/layout.tsx`
- `docs/UI_UX_GUIDE.md`
- `state.md`

Validacao pendente nesta etapa:

- `git diff --check`
- `npm run typecheck`
- `npm run lint`
- teste browser desktop/mobile do menu admin.

### 2026-07-10 - Mapeamento de output PDF/planilha da Simulacao Final

- Analisados os arquivos reais de referencia:
  - `/Users/hugoferreira/Downloads/MOBITA CAPACETE.pdf`;
  - `/Users/hugoferreira/Downloads/MOBITA CAPACETE.xlsx`.
- Criado `docs/FINAL_SIMULATION_OUTPUT_MAPPING.md` com o mapeamento dos blocos do PDF cliente:
  - cabecalho;
  - dados da simulacao;
  - dados logisticos;
  - tabela de produtos;
  - nota fiscal de entrada;
  - nota fiscal de saida;
  - composicao da base de ICMS;
  - observacoes/disclaimers.
- Mapeada tambem a planilha interna:
  - relatorio detalhado de despesas aduaneiras;
  - bloco interno de Encomenda;
  - campos internos que nao devem aparecer no PDF cliente.
- Comparado o output real com as tabelas atuais do modulo:
  - `final_simulations`;
  - `final_simulation_items`;
  - `simulation_expense_lines`;
  - `simulation_tax_lines`;
  - `invoice_parametrizations`;
  - `calculation_snapshot`;
  - `simulation_documents`;
  - `uploads`.
- Atualizado `docs/DATABASE_MODEL.md` com observacoes de lacunas para PDF cliente e relatorio interno, sem criar migration.
- Nao houve alteracao em `src/`, migrations, calculo, `package.json`, Supabase ou producao.

Arquivos principais:

- `docs/FINAL_SIMULATION_OUTPUT_MAPPING.md`
- `docs/DATABASE_MODEL.md`
- `state.md`

Validado:

- Extracao textual/visual do PDF de uma pagina.
- Leitura da planilha `Sheet`, incluindo blocos de PDF, despesas e Encomenda.
- Revisao documental cruzada com migrations e modelo atual.

Proxima etapa recomendada:

- Fechar contrato de `public_snapshot`/`internal_snapshot`, formulas oficiais e lacunas de modelagem antes de iniciar PDF cliente.

### 2026-07-10 - Visualizacao detalhada do calculo fiscal salvo

- Evoluida a secao `Cálculo Fiscal V1` no detalhe da Simulacao Final para exibir o calculo salvo, sem recalcular automaticamente ao abrir a pagina.
- `getSimulationTaxLines` passou a retornar linhas fiscais enriquecidas com descricao do produto e NCM por busca auxiliar em `final_simulation_items`.
- O card agora mostra:
  - status calculado/nao calculado;
  - formula e data/hora do calculo quando disponivel em `calculation_snapshot.calculated_at`;
  - resumo consolidado salvo em `calculation_snapshot.totals`;
  - warnings salvos em `calculation_snapshot.warnings`;
  - tabela de linhas fiscais por produto com produto, NCM, imposto, base, aliquota, valor, manual e observacao/ajuste.
- A action de recalc passou a gravar `calculated_at` no `calculation_snapshot` para exibicao futura.
- Estado vazio implementado: quando nao ha calculo fiscal salvo, exibe a mensagem para usar `Recalcular impostos`.
- Nao houve migration, RLS, auth, middleware, layout global, `package.json`, `temp/`, PDF, producao ou alteracao da formula fiscal V1.

Arquivos principais:

- `src/features/final-simulations/FinalSimulationTaxPreviewSection.tsx`
- `src/features/final-simulations/actions.ts`
- `src/features/final-simulations/queries.ts`
- `src/features/final-simulations/types.ts`
- `docs/ROUTES_AND_SCREENS.md`
- `state.md`

Validado no Supabase Dev/browser:

- Simulacao com calculo salvo exibiu resumo consolidado e 5 linhas fiscais para 1 produto.
- Recalculo atualizou data/hora e manteve 5 linhas, sem duplicidade.
- Simulacao sem calculo salvo exibiu:
  - `Status: não calculado`;
  - `Nenhum cálculo fiscal salvo ainda. Use Recalcular impostos para gerar as linhas.`

Proxima etapa recomendada:

- Fechar checkpoint da visualizacao fiscal salva ou evoluir relatorio interno/PDF com base nesses snapshots.

### 2026-07-10 - Persistencia do calculo fiscal V1

- Criada action administrativa `recalculateFinalSimulationTaxesAction` para recalcular impostos da Simulacao Final.
- A action usa `getFinalSimulationTaxPreviewInput` e `calculateFinalSimulationTaxPreview`, mantendo a formula V1 pura como fonte do calculo.
- Persistencia implementada sem migration:
  - substitui linhas nao manuais antigas em `simulation_tax_lines`;
  - insere 5 linhas brutas por item: `II`, `IPI`, `PIS_IMPORTACAO`, `COFINS_IMPORTACAO`, `ICMS`;
  - atualiza em `final_simulations` os campos existentes `customs_value_brl`, `total_taxes_brl`, `total_cost_brl`, `calculation_snapshot` e `updated_by`.
- Creditos tributarios nao viram linhas negativas porque o schema atual de `simulation_tax_lines.tax_type` nao tem tipo claro para credito; eles entram no total liquido (`total_taxes_brl`) e no `calculation_snapshot`.
- Criada secao/card `Cálculo Fiscal V1` no detalhe da Simulacao Final com preview, warnings, quantidade de linhas persistidas e botao `Recalcular impostos`.
- Recalculo e bloqueado com mensagem amigavel quando a simulacao nao tem produtos, cambio valido ou FOB positivo.
- Nao houve migration, RLS, auth, middleware, layout global, `package.json`, `temp/`, PDF, producao ou alteracao da formula pura.

Arquivos principais:

- `src/features/final-simulations/actions.ts`
- `src/features/final-simulations/queries.ts`
- `src/features/final-simulations/types.ts`
- `src/features/final-simulations/FinalSimulationTaxPreviewSection.tsx`
- `src/app/admin/simulacoes-finais/[id]/page.tsx`
- `docs/ROUTES_AND_SCREENS.md`
- `state.md`

Validado no Supabase Dev:

- Simulacao com 1 produto FOB USD 100, cambio 5.20, despesa 150, II 18, IPI 0, PIS 2.1, COFINS 9.65, ICMS 18 e comissao 2.5%.
- UI exibiu:
  - FOB BRL `520`;
  - despesas `150`;
  - base aduaneira `670`;
  - impostos brutos `355.81`;
  - comissao `13.00`;
  - custo total estimado `1038.81`.
- Banco Dev confirmou:
  - 5 linhas em `simulation_tax_lines`;
  - sem duplicidade apos segundo recalculo;
  - `customs_value_brl = 670`;
  - `total_taxes_brl = 355.81`;
  - `total_cost_brl = 1038.81`;
  - `calculation_snapshot.scope = tax_recalculation`.
- Simulacao sem produto exibiu erro amigavel e manteve `0` linhas fiscais.

Limitacoes V1:

- Linhas fiscais persistem impostos brutos; creditos ficam no consolidado/snapshot.
- ICMS ainda nao faz gross-up por dentro.
- Despesas continuam rateadas somente por FOB.
- Comportamentos fiscais das despesas ainda nao alteram bases.

Proxima etapa recomendada:

- Fechar checkpoint desta persistencia ou evoluir a UI de detalhe das linhas fiscais salvas antes de PDF/relatorio.

### 2026-07-10 - Preview puro de calculo fiscal da Simulacao Final

- Implementado o motor puro V1 em `calculation-engine.ts` para gerar preview fiscal em memoria, sem persistencia.
- Criados tipos de input/output para `FinalSimulationTaxPreview`, itens, totais e warnings.
- O calculo V1 estima:
  - FOB BRL;
  - rateio proporcional de despesas por FOB;
  - base aduaneira simplificada;
  - II, IPI, PIS, COFINS e ICMS simplificados por item;
  - impostos brutos;
  - creditos tributarios liquidos para IPI/PIS/COFINS/ICMS;
  - comissao trade por percentual ou valor fixo;
  - custo total estimado.
- Adicionado helper server-side `getFinalSimulationTaxPreviewInput` para montar input do preview a partir de `final_simulations`, `final_simulation_items` e `simulation_expense_lines`.
- Warnings V1 cobrem cambio invalido, ausencia de produtos, FOB zerado, NCM ausente, ICMS zerado e snapshots de NF Entrada/Saida ausentes.
- Nao houve migration, RLS, auth, middleware, layout global, UI nova, `package.json`, `temp/`, `simulation_tax_lines`, alteracao de totais persistidos, PDF ou producao.

Arquivos principais:

- `src/features/final-simulations/calculation-engine.ts`
- `src/features/final-simulations/queries.ts`
- `state.md`

Validado:

- `git diff --check` passou.
- `npm run typecheck` passou.
- Teste numerico temporario via Node compilando o motor para `/tmp` confirmou:
  - `total_fob_brl = 520`;
  - `total_expenses_brl = 150`;
  - `total_customs_base_brl = 670`;
  - `ii_brl = 120.60`;
  - `ipi_brl = 0`;
  - `pis_brl = 14.07`;
  - `cofins_brl = 64.66`;
  - `icms_brl = 156.48`;
  - `gross_taxes_brl = 355.81`;
  - sem creditos, `net_taxes_brl = 355.81`;
  - sem comissao, `estimated_total_cost_brl = 1025.81`;
  - com creditos PIS/COFINS/ICMS, `tax_credits_brl = 235.21` e `net_taxes_brl = 120.60`;
  - com comissao percentual `2,5`, `trade_commission_brl = 13.00`.

Limitacoes V1:

- ICMS nao faz gross-up por dentro.
- Despesas sao rateadas somente por FOB.
- Comportamentos fiscais de despesas ainda nao alteram bases.
- Preview nao grava `simulation_tax_lines` nem atualiza totais de `final_simulations`.

Proxima etapa recomendada:

- Expor o preview em UI simples no detalhe da Simulacao Final ou criar a persistencia controlada de `simulation_tax_lines` em etapa posterior.

### 2026-07-10 - Secao Fiscal no detalhe da Simulacao Final

- Adicionada a secao `Parametrização Fiscal` no detalhe de `/admin/simulacoes-finais/[id]`.
- A secao permite selecionar parametrizacao ativa de NF Entrada e NF Saida, usando as options de `invoice_parametrizations`.
- Snapshots atuais de entrada/saida sao exibidos com codigo, descricao, CFOP, regime e ICMS.
- Adicionados controles para creditos IPI, PIS, COFINS e ICMS, notas fiscais internas e comissao trade.
- O modo de comissao trade controla os campos visiveis:
  - `none`: zera percentual e valor fixo;
  - `percent`: exige percentual e zera valor fixo;
  - `fixed_expense`: exige valor fixo BRL e zera percentual.
- A action server-side continua montando snapshots e validando que entrada usa `operation_type = entrada` e saida usa `operation_type = saida`.
- Ajustado o retorno de sucesso da action fiscal para preservar os valores salvos na UI apos submit.
- Atualizado `docs/ROUTES_AND_SCREENS.md`.
- Nao houve migration, RLS, auth, middleware, layout global, `package.json`, `temp/`, calculo fiscal final, `simulation_tax_lines`, PDF, alteracao de totais financeiros ou producao.

Arquivos principais:

- `src/app/admin/simulacoes-finais/[id]/page.tsx`
- `src/features/final-simulations/FinalSimulationFiscalSection.tsx`
- `src/features/final-simulations/actions.ts`
- `src/features/final-simulations/schemas.ts`
- `src/features/final-simulations/fiscal-labels.ts`
- `docs/ROUTES_AND_SCREENS.md`
- `state.md`

Validado:

- Teste browser no Supabase Dev em `http://localhost:3003`:
  - selecao de NF Entrada e NF Saida;
  - marcacao de creditos;
  - comissao percentual `2,5`;
  - salvamento com snapshots exibidos;
  - limpeza de NF Entrada mantendo NF Saida.
- Validacao direta no Supabase Dev confirmou:
  - `entry_invoice_parametrization_id = null` apos limpar;
  - `entry_invoice_parametrization_snapshot = {}`;
  - `exit_invoice_parametrization_id` preservado;
  - snapshot de saida preenchido;
  - `credits_* = true`;
  - `trade_commission_mode = percent`;
  - `trade_commission_percent = 2.5`;
  - totais financeiros finais permaneceram sem alteracao.

Proxima etapa recomendada:

- Fechar checkpoint da secao fiscal ou iniciar parametrizacao de impostos por encomenda sem calcular impostos finais ainda.

### 2026-07-10 - UI admin de Parametrizacoes Fiscais

- Criadas rotas administrativas para CRUD de `invoice_parametrizations`:
  - `/admin/cadastros/parametrizacoes-fiscais`;
  - `/admin/cadastros/parametrizacoes-fiscais/nova`;
  - `/admin/cadastros/parametrizacoes-fiscais/[id]/editar`.
- A listagem exibe codigo, tipo, descricao, CFOP, regime, ICMS, cliente/filial, status e acoes.
- Filtros simples implementados: busca textual, tipo e status.
- Criado formulario administrativo para codigo, chave, tipo, descricao, natureza, CFOP, grupo, regime, ICMS, escopo, perfil, filial, cliente, flags e observacoes internas.
- Criadas acoes de linha para editar e ativar/inativar parametrizacoes fiscais usando as actions server-side ja existentes.
- Adicionado link `Parametrizações Fiscais` na navegacao admin.
- Atualizado `docs/ROUTES_AND_SCREENS.md`.
- Nao houve migration, RLS, auth, middleware, layout global, `package.json`, `temp/`, secao fiscal dentro da simulacao, calculo fiscal, `simulation_tax_lines`, PDF ou producao.

Arquivos principais:

- `src/app/admin/cadastros/parametrizacoes-fiscais/page.tsx`
- `src/app/admin/cadastros/parametrizacoes-fiscais/nova/page.tsx`
- `src/app/admin/cadastros/parametrizacoes-fiscais/[id]/editar/page.tsx`
- `src/features/final-simulations/InvoiceParametrizationForm.tsx`
- `src/features/final-simulations/InvoiceParametrizationRowActions.tsx`
- `src/features/final-simulations/fiscal-labels.ts`
- `src/lib/navigation.ts`
- `docs/ROUTES_AND_SCREENS.md`
- `state.md`

Validado:

- `git diff --check` passou.
- `npm run typecheck` passou.
- `npm run lint` passou.
- Teste browser no Supabase Dev passou em `http://localhost:3002`:
  - login admin Dev;
  - listagem de parametrizacoes fiscais;
  - criacao de NF entrada;
  - criacao de NF saida;
  - edicao de NF entrada;
  - inativacao e reativacao;
  - filtros por tipo, status ativo e busca textual.

Proxima etapa recomendada:

- Depois de validar e commitar esta UI, criar a secao fiscal dentro do detalhe/edicao da Simulacao Final para selecionar entrada/saida e gravar snapshots.

### 2026-07-10 - Camada server de Parametrizacao Fiscal

- Criada a camada server-side inicial para `invoice_parametrizations` e configuracoes fiscais de Simulacoes Finais.
- Adicionados tipos, enums e inputs para:
  - `InvoiceParametrization`;
  - operacao `entrada`/`saida`;
  - grupos, regimes, escopo de destino e perfil de cliente;
  - configuracoes fiscais da simulacao;
  - modo de comissao da trade.
- Criados schemas para parametrizacao fiscal e configuracoes fiscais da simulacao.
- Criadas queries administrativas para listar, buscar por ID, listar opcoes ativas por tipo de operacao e ler configuracoes fiscais da simulacao.
- Criadas actions administrativas para criar, atualizar, ativar/desativar e desativar como exclusao logica de parametrizacoes fiscais.
- Criada action para atualizar configuracoes fiscais da Simulacao Final, validando que NF entrada usa parametrizacao `entrada` e NF saida usa `saida`.
- O snapshot de parametrizacao fiscal grava campos principais do cadastro selecionado, incluindo codigo, tipo, descricao, CFOP/natureza, grupo, regime, ICMS, escopo, cliente/filial e timestamp do snapshot.
- Nao houve migration, RLS, auth, middleware, layout global, UI/rotas, `package.json`, `temp/`, producao, calculo fiscal final, `simulation_tax_lines`, PDF ou alteracao de totais.

Arquivos principais:

- `src/features/final-simulations/types.ts`
- `src/features/final-simulations/schemas.ts`
- `src/features/final-simulations/queries.ts`
- `src/features/final-simulations/actions.ts`
- `state.md`

Validado:

- `git diff --check`
- `npm run typecheck`
- `npm run lint`

Proxima etapa recomendada:

- Criar UI admin de cadastro de parametrizacoes fiscais e uma secao na Simulacao Final para selecionar entrada/saida e salvar os snapshots.

### 2026-07-10 - Migration de Parametrizacao Fiscal de Simulacoes Finais

- Criada migration incremental para suportar parametrizacoes fiscais de NF entrada/saida no modulo de Simulacoes Finais.
- Nova tabela `invoice_parametrizations` preparada para codigo, tipo de operacao, descricao, natureza, CFOP, grupo de operacao, regime, destino, perfil de cliente, ICMS, filial/cliente opcional e auditoria por `app_users`.
- Adicionados campos fiscais em `final_simulations` para:
  - comissao da trade;
  - flags de creditos IPI/PIS/COFINS/ICMS;
  - snapshot de regime fiscal;
  - validacao de creditos;
  - parametrizacao/snapshot de NF entrada e NF saida.
- Criados checks para `operation_type`, `operation_group`, `tax_regime`, `destination_scope`, `customer_profile` e `trade_commission_mode`.
- Criados indices para consultas por tipo, codigo, ativo, cliente e parametrizacoes vinculadas a `final_simulations`.
- Habilitado RLS em `invoice_parametrizations` com policies admin-only usando `public.is_admin()`.
- Reutilizado `public.set_updated_at()` para `invoice_parametrizations`.
- Atualizado `docs/DATABASE_MODEL.md`.
- Nao houve UI, alteracao em `src/`, `package.json`, auth/RLS fora da nova tabela, `temp/`, db push real ou producao.

Arquivos principais:

- `supabase/migrations/20260710120000_create_invoice_parametrizations.sql`
- `docs/DATABASE_MODEL.md`
- `state.md`

Validado:

- Revisao estatica da migration.
- `git diff --check`.

Proxima etapa recomendada:

- Validar a migration via dry-run no Supabase Dev antes de criar camada TypeScript/actions para parametrizacao fiscal.

### 2026-07-10 - Validacoes minimas de Simulacoes Finais

- Criadas validacoes minimas para criacao e edicao de dados principais de Simulacoes Finais.
- A simulação agora exige cliente vinculado ou nome do cliente, data da cotacao, validade, modalidade, via de transporte, origem, destino, Incoterm, moeda e cambio.
- `valid_until` nao pode ser anterior a `quote_date`.
- `exchange_rate` deve ser maior que zero.
- `currency` deve ter exatamente 3 caracteres.
- `import_modality` e `transport_mode` seguem apenas os enums ja previstos.
- O formulario de dados principais exibe erro inline nos campos obrigatorios e o campo de cambio passou a aceitar entrada decimal textual com `inputMode="decimal"`.
- Nao houve migration, RLS, auth, middleware, layout global, `package.json`, `temp/`, fiscal, PDF ou calculo novo.

Arquivos principais:

- `src/features/final-simulations/schemas.ts`
- `src/features/final-simulations/FinalSimulationMainDataForm.tsx`
- `state.md`

Validado:

- Browser local apontando para Supabase Dev:
  - tentativa de criar simulação vazia ficou bloqueada em `/admin/simulacoes-finais/nova`;
  - mensagens exibidas para cliente, data da cotacao, validade, modalidade, transporte, origem, destino, Incoterm e cambio;
  - criada simulação minima `43fcc9d4-d20c-4876-bece-bdb8b45cc996`;
  - registro confirmado em `final_simulations` no Supabase Dev com `exchange_rate = 5.2`.

Proxima etapa recomendada:

- Validar a edicao de simulacoes antigas vazias, garantindo preenchimento dos mesmos campos antes de salvar.

### 2026-07-10 - Correcao de normalizacao numerica em Simulacoes Finais

- Corrigido o parser numerico usado pelos schemas e calculos basicos de Simulacoes Finais.
- Valores com ponto decimal internacional deixam de ser tratados como milhares:
  - `5.20` vira `5.2`
  - `1.7` vira `1.7`
  - `2.1` vira `2.1`
  - `9.65` vira `9.65`
- Mantido suporte para formato brasileiro com virgula decimal e milhares:
  - `5,20` vira `5.2`
  - `1.234,56` vira `1234.56`
- Adicionado suporte contextual para milhares internacionais, como `1,234.56`.
- Entradas invalidas agora viram erro de validacao nos schemas em vez de passarem como numero silenciosamente incorreto.
- Nao houve migration, RLS, auth, `package.json`, producao ou `temp/`.

Arquivos principais:

- `src/features/final-simulations/calculation-engine.ts`
- `src/features/final-simulations/schemas.ts`
- `state.md`

Validado:

- `git diff --check`
- `npm run typecheck`
- `npm run lint`
- Teste manual no browser local apontando para Supabase Dev:
  - criada simulacao `011f45ab-57e6-41e2-ac02-c29536bf74d1`;
  - cambio `5.20` exibido como `5,20`;
  - produto com quantidade `10`, preco `10.98`, PL `1.7`, PB `2`, PIS `2.1` e COFINS `9.65`;
  - totais exibidos: `US$ 109,80`, `17,00 kg` liquido e `20,00 kg` bruto.

Proxima etapa recomendada:

- Revisar dados de teste antigos criados antes da correcao, pois podem manter valores ja gravados com escala errada.

### 2026-07-10 - Estrutura local Supabase Dev/Prod

- Criados arquivos locais ignorados pelo Git para configurar Supabase CLI por ambiente:
  - `.env.supabase.dev`
  - `.env.supabase.prod`
- Criados exemplos versionados sem secrets:
  - `.env.supabase.dev.example`
  - `.env.supabase.prod.example`
- Atualizado `.gitignore` para proteger arquivos reais de ambiente Supabase e variantes de producao.
- Criados scripts seguros para link, dry-run e push de migrations em Dev e Producao.
- Push em Producao exige `CONFIRM_PROD_DB_PUSH=YES`.
- Scripts de Producao tentam voltar o link do Supabase CLI para Dev ao final.
- Criado `docs/ENVIRONMENTS.md` com o fluxo operacional Dev/Prod.
- Atualizado `AGENTS.md` com regras curtas de operacao Supabase Dev/Prod.
- Nao foram aplicadas migrations, nao foi rodado `db push` real, nao houve alteracao de codigo da aplicacao, `package.json`, Vercel ou `temp/`.

Validado:

- `chmod +x scripts/supabase-*.sh`
- `git diff --check`
- `git status --short`
- `git check-ignore -v .env.supabase.dev .env.supabase.prod .env.prod .env.prod.local .env.production.local`
- Busca local confirmou apenas placeholders nos novos arquivos de ambiente, sem secrets reais.

### 2026-07-10 - Etapa 6.4: processamento de pre-calculo em Simulacoes Finais

- Adicionada a seção `Despesas` no detalhe de `/admin/simulacoes-finais/[id]`.
- Implementado processamento de `expense_presets` ativos para gerar `simulation_expense_lines`.
- Reprocessar o mesmo pre-calculo remove apenas linhas anteriores geradas por ele e preserva despesas manuais.
- Criadas actions server-side para:
  - processar pre-calculo na simulacao;
  - adicionar despesa manual;
  - editar despesa manual ou linha editavel gerada por preset;
  - remover despesa manual ou linha editavel gerada por preset.
- Criadas queries para listar despesas da simulacao, listar presets ativos compatíveis com a via de transporte e buscar preset com itens.
- Criados schemas para validar processamento de preset, despesa manual e edicao de linha de despesa.
- `calculation-engine.ts` passou a calcular somente o total basico de despesas BRL por soma de `amount_brl`.
- `final_simulations.total_expenses_brl` e recalculado apos processar, adicionar, editar ou remover despesas.
- O comportamento aplicado respeita a modalidade da simulacao (`propria`, `conta_e_ordem`, `encomenda`) e pula itens com comportamento `not_applicable`.
- Nao foram criadas migrations, policies, rotas novas, calculo fiscal final, rateio por produto, CIF final, PDF, dependencias novas, alteracoes em auth/middleware/layout global, `package.json` ou `temp/`.

Arquivos principais:

- `src/app/admin/simulacoes-finais/[id]/page.tsx`
- `src/features/final-simulations/SimulationExpensesSection.tsx`
- `src/features/final-simulations/actions.ts`
- `src/features/final-simulations/calculation-engine.ts`
- `src/features/final-simulations/queries.ts`
- `src/features/final-simulations/schemas.ts`
- `src/features/final-simulations/types.ts`
- `state.md`

Validado:

- `git diff --check`
- `npm run typecheck`
- `npm run lint`

Proxima etapa recomendada:

- Validar manualmente em uma simulação final com pre-calculo cadastrado; depois avançar para despesas/rateios mais completos ou parametrização fiscal, sem ainda fechar impostos finais.

### 2026-07-09 - Etapa 6.3: UI admin de tipos de despesa e pre-calculos

- Criadas rotas administrativas para Tipos de Despesa:
  - `/admin/cadastros/tipos-despesa`
  - `/admin/cadastros/tipos-despesa/novo`
  - `/admin/cadastros/tipos-despesa/[id]/editar`
- Criadas rotas administrativas para Pre-calculos de Despesas:
  - `/admin/cadastros/pre-calculos-despesas`
  - `/admin/cadastros/pre-calculos-despesas/novo`
  - `/admin/cadastros/pre-calculos-despesas/[id]/editar`
- As listagens usam o padrao admin atual com `CrudHeaderWithFilters`, `DataTable`, `StatusBadge` e filtros simples.
- Os formularios usam `useActionState` e reutilizam as actions server-side da Etapa 6.2.
- Tipos de despesa podem ser criados, editados e inativados via `archiveOrDeactivateExpenseTypeAction`.
- Pre-calculos podem ser criados, editados e inativados via `archiveOrDeactivateExpensePresetAction`.
- A tela de edicao de pre-calculo permite listar, adicionar, editar e remover itens do preset usando apenas tipos de despesa ativos.
- Adicionados links no menu admin para `Tipos de Despesa` e `Pré-cálculos`, sem reorganizar o menu inteiro.
- Atualizado `docs/ROUTES_AND_SCREENS.md` com as novas rotas.
- Nao foram criadas migrations, policies, processamento de pre-calculo em simulacao, alteracoes em `simulation_expense_lines`, calculo fiscal, PDF, dependencias novas, alteracoes em auth/middleware/layout global, `package.json` ou `temp/`.

Arquivos principais:

- `src/app/admin/cadastros/tipos-despesa/page.tsx`
- `src/app/admin/cadastros/tipos-despesa/novo/page.tsx`
- `src/app/admin/cadastros/tipos-despesa/[id]/editar/page.tsx`
- `src/app/admin/cadastros/pre-calculos-despesas/page.tsx`
- `src/app/admin/cadastros/pre-calculos-despesas/novo/page.tsx`
- `src/app/admin/cadastros/pre-calculos-despesas/[id]/editar/page.tsx`
- `src/features/final-simulations/ExpenseTypeForm.tsx`
- `src/features/final-simulations/ExpensePresetForm.tsx`
- `src/features/final-simulations/ExpensePresetItemsSection.tsx`
- `src/features/final-simulations/ExpenseMasterRowActions.tsx`
- `src/features/final-simulations/expense-labels.ts`
- `src/features/final-simulations/schemas.ts`
- `src/lib/navigation.ts`
- `docs/ROUTES_AND_SCREENS.md`
- `state.md`

Validado:

- `git diff --check`
- `npm run typecheck`
- `npm run lint`

Proxima etapa recomendada:

- Validar manualmente os CRUDs no navegador com a migration aplicada; depois implementar a aplicacao de presets na Simulacao Final sem criar calculo fiscal completo.

### 2026-07-09 - Etapa 6.2: camada TypeScript de tipos de despesa e pre-calculos

- Criada a camada TypeScript server-side para os cadastros mestres `expense_types`, `expense_presets` e `expense_preset_items`.
- Adicionados tipos de dominio, valores enumerados e valores de formulario para modalidades, tipos de rateio, tipos de calculo, comportamentos e vias de transporte.
- Criados schemas manuais para criar/editar tipos de despesa, pre-calculos e itens de pre-calculo.
- Criadas queries administrativas para listar, buscar por ID, listar ativos, listar itens de preset e listar presets ativos por via de transporte.
- Criadas actions administrativas para criar, atualizar e desativar tipos de despesa e pre-calculos.
- Criadas actions para adicionar, atualizar e remover fisicamente itens de pre-calculo.
- As actions usam `requireRole("admin")`, validam entrada antes de gravar e usam `createAdminClient()` para writes server-side.
- Tipos de despesa e pre-calculos sao desativados via `is_active = false`; itens de preset podem ser removidos fisicamente por afetarem apenas o cadastro mestre.
- Nao foi criado processamento para gerar `simulation_expense_lines`.
- Nao foram criadas migrations, UI, rotas, calculo fiscal, PDF, dependencias novas, alteracoes em auth/middleware/layout global, `package.json` ou `temp/`.

Arquivos principais:

- `src/features/final-simulations/types.ts`
- `src/features/final-simulations/schemas.ts`
- `src/features/final-simulations/queries.ts`
- `src/features/final-simulations/actions.ts`
- `state.md`

Validado:

- `git diff --check`
- `npm run typecheck`
- `npm run lint`

Proxima etapa recomendada:

- Revisar diff e, depois, implementar UI administrativa dos cadastros mestres de despesas ou a aplicacao de presets em uma Simulacao Final.

### 2026-07-09 - Etapa 6.1: migration de tipos de despesa e pre-calculos

- Criada migration incremental para os cadastros mestres de despesas do modulo Simulacoes Finais.
- Criadas as tabelas `expense_types`, `expense_presets` e `expense_preset_items`.
- `expense_types` prepara classificacao de modalidade, tipo de rateio, tipo de calculo, comportamentos por modalidade, flags operacionais/fiscais, campos financeiros/ERP opcionais e controle de ativo.
- `expense_presets` prepara pre-calculos por via de transporte.
- `expense_preset_items` relaciona presets a tipos de despesa, com snapshots, valores padrao e overrides opcionais.
- As FKs de auditoria usam `app_users`.
- Reutilizado `public.set_updated_at()` nos triggers de `updated_at`.
- RLS habilitado nas tres tabelas, com policies conservadoras admin-only usando `public.is_admin()`.
- Nao foram criados seeds nesta etapa.
- Nao foram criadas UI, processamento de pre-calculo, `invoice_parametrizations`, `simulation_encomenda_taxes`, calculo fiscal final, PDF, policies de cliente, bucket novo ou alteracoes em `uploads`.
- Nenhum arquivo em `src/`, `package.json` ou `temp/` foi alterado.

Arquivos principais:

- `supabase/migrations/20260709213000_create_expense_types_and_presets.sql`
- `docs/DATABASE_MODEL.md`
- `state.md`

Validado:

- Revisao estatica da migration criada.
- Confirmado que `public.is_admin()` ja existe e usa `app_users`.
- Confirmado que `public.set_updated_at()` ja existe e foi reutilizada.
- Confirmada ausencia de `profiles`, buckets, `uploads`, seeds, `src/`, `package.json` e `temp/` nesta migration.
- `git diff --check`

Nao foi possivel validar ainda:

- Aplicacao da migration em Supabase/Postgres local, pois a etapa nao deve depender de Docker/Supabase local.

Proxima etapa recomendada:

- Revisar/aplicar a migration em ambiente controlado e, depois, criar a camada TypeScript/UI para despesas e aplicacao de presets na Simulacao Final.

### 2026-07-09 - Etapa 5: Produtos e NCM local das Simulacoes Finais

- Implementada a primeira versao da secao de Produtos no detalhe de `/admin/simulacoes-finais/[id]`.
- A tela agora lista produtos de `final_simulation_items` com descricao, NCM, aliquotas basicas, pesos, quantidade, preco, totais e acoes.
- Adicionado formulario para incluir produto usando `addFinalSimulationItemAction`.
- Adicionada edicao de produto usando `updateFinalSimulationItemAction`.
- Adicionada remocao de produto com confirmacao usando `deleteFinalSimulationItemAction`.
- A busca local de NCM usa `searchNcmCodes` com o parametro `ncmSearch` na propria tela de detalhe.
- Quando o NCM existe em `ncm_codes`, a action salva descricao oficial, fonte, data da fonte e snapshot basico.
- Quando existe perfil em `ncm_tax_profiles`, a action preenche II, IPI, PIS e COFINS a partir do perfil local mais recente e registra snapshot fiscal.
- Quando o NCM nao existe na base local, a inclusao continua permitida e a UI exibe alerta de validacao pendente.
- Os totais basicos do item continuam sendo calculados por `calculation-engine.ts`: valor total, peso liquido total e peso bruto total.
- Apos incluir, editar ou remover produto, os totais basicos da simulacao sao recalculados: `total_products_usd`, `net_weight` e `gross_weight`.
- A edicao de produtos permanece bloqueada pelas actions para simulacoes em `approved`, `sent_to_customer` ou `archived`.
- Nao foram implementados integracao externa Receita/Classif, despesas, impostos finais, CIF final, PDF, relatorio interno, migrations, policies, auth, middleware, layout global, dependencias novas ou alteracoes em `temp/`.

Arquivos principais:

- `src/app/admin/simulacoes-finais/[id]/page.tsx`
- `src/features/final-simulations/FinalSimulationItemsSection.tsx`
- `src/features/final-simulations/actions.ts`
- `src/features/final-simulations/schemas.ts`
- `src/features/final-simulations/types.ts`
- `state.md`

Validado:

- `git diff --check`
- `npm run typecheck`
- `npm run lint`

Proxima etapa recomendada:

- Validar manualmente inclusao/edicao/remocao contra banco com a migration aplicada; depois avancar para despesas ou parametrizacao fiscal.

### 2026-07-09 - Ajuste de navegacao das Simulacoes Finais

- Adicionado o item `Simulações Finais` na navegacao administrativa existente.
- O link aponta para `/admin/simulacoes-finais` e reutiliza o mesmo padrao visual, mobile/desktop e regra de acesso do menu admin.
- Nenhuma rota, migration, auth, middleware, `package.json`, `temp/`, produto, despesa, PDF, NCM UI ou calculo fiscal avancado foi alterado.

Arquivos principais:

- `src/lib/navigation.ts`
- `state.md`

Validado:

- `git diff --check`
- `npm run typecheck`
- `npm run lint`

Proxima etapa recomendada:

- Testar visualmente o menu admin e seguir para a etapa de produtos/NCM quando o CRUD minimo estiver validado no ambiente conectado.

### 2026-07-09 - Etapa 4: UI administrativa minima das Simulacoes Finais

- Criada a primeira interface administrativa do modulo em `/admin/simulacoes-finais`.
- Criadas as rotas:
  - `/admin/simulacoes-finais`
  - `/admin/simulacoes-finais/nova`
  - `/admin/simulacoes-finais/[id]`
  - `/admin/simulacoes-finais/[id]/editar`
- A listagem usa `listFinalSimulations`, filtros simples por codigo, numero, cliente e status, tabela padronizada e acoes de abrir/editar.
- A tela de nova simulacao usa `createFinalSimulationAction` e cria registros em status `draft`.
- A tela de detalhe usa `getFinalSimulationById` e exibe dados principais, status e totais basicos.
- A tela de edicao usa `updateFinalSimulationMainDataAction` e preserva o bloqueio de edicao comum para `approved`, `sent_to_customer` e `archived`.
- Criado o componente `FinalSimulationMainDataForm` para reaproveitar o formulario de dados principais entre criacao e edicao.
- As opcoes de cliente sao carregadas server-side via `getFinalSimulationFormOptions`.
- Atualizada a documentacao de rotas para marcar o modulo como parcial.
- Nao foram implementados produtos, NCM UI, despesas, parametrizacao fiscal, impostos encomenda, PDF, calculo fiscal completo, policies novas ou migrations.
- Nenhum arquivo em `temp/`, `package.json`, auth, middleware ou layout global foi alterado.

Arquivos principais:

- `src/app/admin/simulacoes-finais/page.tsx`
- `src/app/admin/simulacoes-finais/nova/page.tsx`
- `src/app/admin/simulacoes-finais/[id]/page.tsx`
- `src/app/admin/simulacoes-finais/[id]/editar/page.tsx`
- `src/features/final-simulations/FinalSimulationMainDataForm.tsx`
- `src/features/final-simulations/queries.ts`
- `src/features/final-simulations/types.ts`
- `docs/ROUTES_AND_SCREENS.md`
- `state.md`

Validado:

- Inspecao dos padroes atuais das rotas admin, layout admin, componentes UI, formularios e Server Actions.
- `npm run typecheck`

Nao foi possivel validar ainda:

- Fluxo manual completo no banco remoto/local, pois depende da migration estar aplicada no ambiente usado pelo teste.
- Produtos, despesas, PDF, relatorio interno e calculo fiscal avancado, pois ficaram fora do escopo desta etapa.

Proxima etapa recomendada:

- Aplicar/validar a migration no ambiente de desenvolvimento conectado, testar manualmente o CRUD minimo de dados principais e depois implementar a aba de produtos com NCM local/snapshot.

### 2026-07-09 - Etapa 3: base TypeScript das Simulacoes Finais

- Criada a estrutura base do modulo em `src/features/final-simulations/`.
- Adicionados tipos de dominio, status, valores de formulario, linhas de simulacao, itens e NCM.
- Criados schemas manuais de validacao, seguindo o padrao atual do projeto sem Zod ou dependencia nova.
- Criadas queries server-side administrativas para listar/buscar Simulacoes Finais, itens e NCM local.
- Criadas Server Actions basicas para criar Simulacao Final, atualizar dados principais, adicionar/editar/remover item e recalcular totais basicos.
- As actions usam `requireRole("admin")` antes de operacoes sensiveis e `createAdminClient()` para writes server-side.
- As actions bloqueiam edicao comum quando a Simulacao Final esta em `approved`, `sent_to_customer` ou `archived`.
- A criacao inicia sempre com status `draft`.
- O NCM do item e obrigatorio como texto, mas a action nao bloqueia base NCM vazia; quando `ncm_codes` contem o codigo, a action preenche descricao oficial e snapshot basico.
- Criado `calculation-engine.ts` apenas com funcoes puras de totais basicos: total do item, pesos por item e somas de produtos/pesos da simulacao.
- Nao foram implementados II, IPI, PIS, COFINS, ICMS, CIF final, despesas rateadas, antidumping, PDF, relatorio interno, UI ou policies novas.
- Nenhuma migration nova foi criada nesta etapa.
- Nenhum arquivo em `temp/`, `package.json`, auth, middleware ou layout foi alterado.

Arquivos principais:

- `src/features/final-simulations/types.ts`
- `src/features/final-simulations/schemas.ts`
- `src/features/final-simulations/queries.ts`
- `src/features/final-simulations/actions.ts`
- `src/features/final-simulations/calculation-engine.ts`
- `state.md`

Validado:

- Inspecao dos padroes atuais de Server Actions, queries, validacao manual, autorizacao admin, tratamento de erros e `revalidatePath`.
- Leitura dos documentos solicitados antes da edicao.
- `npm run typecheck`
- `npm run lint`

Nao foi possivel validar ainda:

- Fluxo manual em UI, pois nenhuma tela foi implementada nesta etapa.
- Escrita real no banco, pois depende da migration aplicada em ambiente controlado.

Proxima etapa recomendada:

- Revisar diff e depois implementar a primeira UI administrativa minima em `/admin/simulacoes-finais`, ou aplicar a migration em ambiente controlado antes de testar actions contra o banco.

### 2026-07-09 - Etapa 2: migration estrutural das Simulacoes Finais

- Criada a primeira migration incremental do nucleo estrutural de Simulacoes Finais.
- A migration nao aplica SQL de `temp/` diretamente e nao altera migrations existentes.
- Criadas as tabelas: `final_simulations`, `final_simulation_items`, `simulation_tax_lines`, `simulation_expense_lines`, `simulation_versions`, `simulation_documents`, `states`, `ncm_codes` e `ncm_tax_profiles`.
- Usado `app_users` em todas as FKs de usuario.
- Usado `public.clients(id)` para `final_simulations.customer_id`.
- Mantidos `supplier_id`, `branch_id`, `source_preset_id`, `source_preset_item_id` e `expense_type_id` como `uuid` sem FK nesta migration, pois as tabelas correspondentes nao existem no modelo atual ou foram deixadas para migrations posteriores.
- Usado `simulation_documents.upload_id` como FK nullable para `public.uploads(id)`.
- A tabela `uploads` nao foi alterada nesta etapa.
- Reutilizada a funcao `public.set_updated_at()` para triggers de `updated_at`.
- RLS habilitado em todas as novas tabelas.
- Criadas policies conservadoras somente para admins usando `public.is_admin()`.
- Nao foram criadas policies de cliente nesta migration.
- Inserido seed dos 27 estados brasileiros em `states`.
- Atualizado `docs/DATABASE_MODEL.md` com o novo nucleo estrutural, RLS e pendencia conhecida de integracao futura com `uploads.final_simulation_id`.
- Atualizado `docs/OPEN_QUESTIONS.md` com a pendencia futura de ajuste de `uploads`/CHECK para dono direto em Simulacao Final.
- Nenhum arquivo em `src/`, `package.json`, `temp/` ou migration existente foi alterado.

Arquivos principais:

- `supabase/migrations/20260709200000_create_final_simulations_core.sql`
- `docs/DATABASE_MODEL.md`
- `docs/OPEN_QUESTIONS.md`
- `state.md`

Validado:

- Inspecao das migrations existentes antes da edicao.
- Confirmado que `app_users.id` e `uuid`.
- Confirmado que `public.is_admin()` usa `app_users`.
- Confirmado que `public.set_updated_at()` ja existe.
- Confirmado que `uploads` ja existe e que `upload_id` pode referenciar `public.uploads(id)`.
- Revisao estrutural da migration criada: tabelas, checks, indices, triggers, RLS, policies e seed.
- `git diff --check` aprovado.
- Busca estatica confirmou ausencia de referencia a `profiles` legado, bucket `simulation-documents`, criacao de bucket novo, criacao de `uploads` nova ou alteracao de `uploads` na migration.

Nao foi possivel validar ainda:

- Aplicacao da migration em banco local/remoto, pois a etapa nao solicitou executar migrations contra o projeto Supabase.
- `supabase db lint --local --schema public --fail-on error`, porque nao ha Postgres/Supabase local acessivel em `127.0.0.1:54322`.
- Validacao real de policies com usuarios admin e cliente, que deve ocorrer apos aplicar a migration em ambiente controlado.
- Fluxos de UI/actions/calculo, pois permanecem fora do escopo desta etapa.

Proxima etapa recomendada:

- Aplicar a migration em ambiente de desenvolvimento/controlado, validar schema/RLS com admin e cliente, e somente depois iniciar a camada de types/queries/actions ou migrations complementares de despesas/parametrizacao fiscal.

### 2026-07-09 - Fase 0 das Simulacoes Finais: decisoes arquiteturais minimas

- Executada a Fase 0 documental antes de qualquer implementacao de Simulacoes Finais.
- Lidos os documentos ativos: `docs/FINAL_SIMULATIONS_MIGRATION_PLAN.md`, `docs/OPEN_QUESTIONS.md`, `docs/DATABASE_MODEL.md`, `docs/AUTH_AND_PERMISSIONS.md`, `docs/ROUTES_AND_SCREENS.md`, `docs/TECH_STACK.md` e `state.md`.
- Registrado que `app_users` permanece como fonte da verdade para usuarios, roles, status e `client_id`.
- Registrado que `profiles` da implementacao em `temp/` nao deve ser usado como base de novas migrations, RLS, actions ou queries.
- Registrado que documentos de Simulacoes Finais devem seguir o padrao atual `uploads` + bucket privado `app-uploads`, sem criar bucket `simulation-documents` na V1.
- Registrado que o modulo deve nascer em `/admin/simulacoes-finais`, sem substituir `/admin/simulacoes` nesta etapa.
- Registrado que `simulations` continua representando a simulacao/solicitacao basica atual, enquanto `final_simulations` representara o novo modulo completo.
- Registrados os nomes finais recomendados para a proxima etapa de banco: `final_simulations`, `final_simulation_items`, `final_simulation_tax_lines`, `final_simulation_expense_lines`, `final_simulation_encomenda_taxes`, `final_simulation_documents`, `final_simulation_versions`, `ncm_codes`, `expense_types`, `expense_presets`, `expense_preset_items`, `invoice_parametrizations` e `states`.
- Registrados os status V1: `draft`, `in_review`, `needs_adjustment`, `approved`, `sent_to_customer` e `archived`.
- Registrado o escopo V1: listagem, criacao/dados principais, produtos, NCM local/snapshot, despesas/tipos/pre-calculo, parametrizacao fiscal, impostos encomenda, calculo final inicial, PDF cliente e relatorio interno detalhado.
- Registrado o que fica fora da V1: processo de importacao, follow-up operacional, pricing Excel, pedido de compra completo e aplicacao direta das migrations de `temp/`.
- Registrado que `ncm_codes` sera a base local da V1, com integracao Receita/Classif posterior ou rotineira.
- Registrado que o futuro `calculation-engine.ts` deve centralizar o calculo, mas formulas complexas permanecem abertas em `docs/OPEN_QUESTIONS.md`.
- Registrado que PDF cliente e relatorio interno sao artefatos distintos, ambos baseados em snapshot, sem expor campos internos ao cliente.
- Nenhum codigo, migration, `src/`, `package.json`, `supabase/migrations/` ou `temp/` foi alterado.

Arquivos principais:

- `docs/FINAL_SIMULATIONS_MIGRATION_PLAN.md`
- `docs/OPEN_QUESTIONS.md`
- `state.md`

Validado:

- Revisao documental dos arquivos solicitados.
- Revisao de consistencia com o modelo atual de banco, auth, rotas, stack e estado vivo.
- Revisao de diff documental.
- Confirmacao de que as alteracoes ficaram restritas aos tres arquivos permitidos.

Nao foi possivel validar ainda:

- Typecheck, lint e build, porque a entrega foi estritamente documental e nao alterou TypeScript, React, migrations ou runtime.
- Formulas fiscais e cenarios numericos reais, que seguem como perguntas abertas.
- Politicas RLS e modelo SQL real, pois nenhuma migration foi criada nesta etapa.

Proxima etapa recomendada:

- Podemos seguir para planejamento/criacao da migration incremental, desde que a proxima etapa respeite as decisoes da Fase 0, mantenha `app_users`, `uploads`/`app-uploads`, rota `/admin/simulacoes-finais` e nao aplique migrations de `temp/` diretamente.

### 2026-07-09 - Revalidacao do plano de migracao das Simulacoes Finais

- Reexecutada a leitura do pedido anexado sobre migracao segura das Simulacoes Finais a partir de `temp/`.
- Reinspecionada a estrutura atual do projeto e a estrutura da pasta temporaria `temp/`, sem alterar nada dentro de `temp/`.
- Confirmado que o projeto atual em `/Users/hugoferreira/htdocs/app-rpx` segue como fonte da verdade.
- Confirmado que os documentos especializados de Simulacoes Finais citados no pedido (`NARWAL_MAPPING`, `FINAL_SIMULATIONS_SPEC`, `CALCULATION_RULES`, `EXPENSES_ENGINE`, `FISCAL_PARAMETRIZATION`, `NCM_INTEGRATION`, `IMPLEMENTATION_PLAN` e `RODRIGO_IMPLEMENTATION_AUDIT`) ainda existem apenas em `temp/docs/`, enquanto o projeto atual possui `FINAL_SIMULATIONS_MIGRATION_PLAN.md` e `OPEN_QUESTIONS.md` como documentos ativos.
- Atualizado `docs/FINAL_SIMULATIONS_MIGRATION_PLAN.md` para registrar explicitamente as fontes verificadas nesta rodada e a recomendacao de promocao documental controlada antes de qualquer migration.
- Atualizado `docs/OPEN_QUESTIONS.md` com perguntas abertas de documentacao e governanca para decidir quais materiais de `temp/docs/` viram especificacoes ativas.
- Nenhum codigo de `src/`, migration, configuracao, dependencia, arquivo dentro de `temp/` ou runtime foi alterado.

Arquivos principais:

- `docs/FINAL_SIMULATIONS_MIGRATION_PLAN.md`
- `docs/OPEN_QUESTIONS.md`
- `state.md`

Validado:

- Inspecao da estrutura atual do projeto.
- Inspecao da estrutura de `temp/`.
- Leitura dos documentos-base atuais e dos documentos especializados em `temp/docs/`.
- Leitura de `state.md` e `temp/state.md`.
- Inspecao das migrations e arquivos principais de `temp/src/features/final-simulations`.
- Revisao de diff documental.

Nao foi possivel validar ainda:

- Typecheck, lint e build, porque a entrega foi estritamente documental e nao alterou TypeScript, React, migrations ou runtime.
- Formulas fiscais, regras de despesas e conteudo final do PDF cliente, que continuam dependentes das perguntas abertas.

Proxima etapa recomendada:

- Aprovar a Fase 0 decidindo se os documentos especializados em `temp/docs/` serao promovidos para `docs/` como specs ativas, e so depois iniciar migrations incrementais no projeto atual.

### 2026-07-09 - Ajuste do callback de recuperacao de senha

- Ajustado `/auth/callback` para aceitar tambem o formato robusto do Supabase com `token_hash` e `type=recovery`.
- O callback passa a usar `supabase.auth.verifyOtp` para links de reset construidos pelo template com `token_hash`.
- Mantido suporte ao fluxo com `code` via `exchangeCodeForSession`.
- Documentado template recomendado de e-mail em portugues usando `token_hash`.
- O motivo do ajuste foi a falha do link recebido por e-mail redirecionando para `/esqueci-senha?error=invalid_link`, compatível com ausencia/perda do code verifier PKCE.

Arquivos principais:

- `src/app/auth/callback/route.ts`
- `docs/AUTH_AND_PERMISSIONS.md`
- `docs/TECH_STACK.md`
- `state.md`

Validado:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Servidor local reiniciado apos limpeza de `.next`, removendo erro de cache/webpack do Next.
- `GET /login` retorna 200 localmente.
- `GET /esqueci-senha` retorna 200 localmente.
- `GET /redefinir-senha` retorna 200 localmente.
- `GET /auth/callback` sem parametros redireciona para `/login?error=auth-callback`.
- `GET /auth/callback?token_hash=fake&type=recovery&next=/redefinir-senha` redireciona para `/esqueci-senha?error=invalid_link`, confirmando tratamento amigavel para token invalido.

Nao foi possivel validar ainda:

- Clique real em novo e-mail usando template `token_hash`, pois depende de atualizar o template no Supabase Dashboard.

Proxima etapa recomendada:

- Atualizar o template `Reset Password` no Supabase para usar o link com `token_hash`, solicitar novo e-mail e testar novamente.

### 2026-07-09 - Recuperacao de senha com Supabase Auth nativo

- Adicionado fluxo publico de recuperacao de senha sem OTP proprio, sem tabela nova, sem migration e sem Resend API direta.
- A tela de login ganhou link `Esqueci minha senha` e mensagem de sucesso para `/login?passwordReset=success`.
- Criada rota publica `/esqueci-senha` para solicitar link de recuperacao com mensagem neutra, sem revelar se o e-mail existe.
- Criado callback `/auth/callback` para trocar o `code` do Supabase por sessao SSR via `exchangeCodeForSession` e redirecionar apenas para path interno seguro.
- Criada rota publica `/redefinir-senha` para definir nova senha quando houver sessao valida de recuperacao.
- A confirmacao do reset valida senha minima de 8 caracteres, confirmacao igual, usuario Supabase presente e conta ativa em `app_users` com `deleted_at is null`.
- Apos redefinir a senha, o fluxo chama `signOut` e redireciona para `/login?passwordReset=success`.
- Padronizada a variavel `NEXT_PUBLIC_SITE_URL` para montar o `redirectTo` do Supabase, com fallback para `VERCEL_URL`, origem da requisicao ou `http://localhost:3000`.
- Documentada a necessidade de liberar Redirect URLs no Supabase Dashboard.
- Confirmado antes da edicao que nao havia callback de Auth existente nem variavel equivalente de URL publica no projeto.

Arquivos principais:

- `src/lib/actions/password-reset.ts`
- `src/components/auth/PasswordResetForms.tsx`
- `src/app/esqueci-senha/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/redefinir-senha/page.tsx`
- `src/app/login/page.tsx`
- `.env.example`
- `docs/AUTH_AND_PERMISSIONS.md`
- `docs/ROUTES_AND_SCREENS.md`
- `docs/TECH_STACK.md`
- `state.md`

Validado:

- Verificacao previa de callback Auth existente.
- Verificacao previa de variaveis equivalentes a URL publica.
- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- Checagem HTTP local confirmou `/login`, `/esqueci-senha` e `/redefinir-senha` retornando 200.
- Checagem HTTP local confirmou `/auth/callback` sem `code` redirecionando para `/login?error=auth-callback`.
- Busca no novo fluxo confirmou ausencia de service role, Resend API, OTP, tabela/token proprio e campos de hash/reset customizados.

Nao foi possivel validar ainda:

- Envio real do e-mail e clique no link de recuperacao, pois depende da configuracao de Redirect URLs e template no Supabase Dashboard.

Proxima etapa recomendada:

- Configurar as Redirect URLs no Supabase Dashboard e fazer um teste real de e-mail: solicitar reset, clicar no link, redefinir senha e entrar com a nova senha.

### 2026-07-09 - Plano documental de migracao das Simulacoes Finais

- Analisada a pasta temporaria `temp/` como referencia da implementacao anterior do Rodrigo para Simulacoes Finais.
- Confirmado que o projeto atual em `/Users/hugoferreira/htdocs/app-rpx` permanece como fonte da verdade.
- Registrado que `temp/` nao deve ser copiada, importada, aplicada como migration, editada ou tratada como codigo ativo.
- Criado `docs/FINAL_SIMULATIONS_MIGRATION_PLAN.md` com inventario do projeto atual, inventario de `temp/`, comparacao com a especificacao Narwal, diferencas criticas, riscos, estrategia recomendada, fases de implementacao e arquivos candidatos a reaproveitamento.
- Criado `docs/OPEN_QUESTIONS.md` com duvidas criticas sobre modelo de dados, rotas, status, RLS, storage, calculos fiscais, despesas, NCM, encomenda, PDF, seeds e validacao.
- A analise identificou divergencias importantes: `temp/` usa `profiles` como base de permissoes, bucket `simulation-documents` e tabela `simulation_documents`, enquanto o projeto atual usa `app_users`, `uploads` e bucket privado `app-uploads`.
- Nenhum codigo de `src/`, migration, Supabase, layout, auth, middleware, `package.json` ou arquivo dentro de `temp/` foi alterado nesta etapa.

Arquivos principais:

- `docs/FINAL_SIMULATIONS_MIGRATION_PLAN.md`
- `docs/OPEN_QUESTIONS.md`
- `state.md`

Validado:

- Inspecao da estrutura atual do projeto.
- Inspecao da estrutura de `temp/`.
- Leitura dos documentos atuais em `docs/`.
- Leitura dos documentos relevantes em `temp/docs/`.
- Leitura de `state.md` e `temp/state.md`.
- Comparacao de rotas, migrations, package.json e feature antiga de Simulacoes Finais.
- Revisao de diff documental.
- Confirmacao de `git status --short` restrito aos tres arquivos esperados.

Nao foi possivel validar ainda:

- Typecheck, lint, build e testes manuais, porque a entrega foi estritamente documental e nao alterou TypeScript, React, migrations ou runtime.
- Formulas fiscais e comportamento final do motor, que dependem das perguntas abertas.

Proxima etapa recomendada:

- Revisar e aprovar as decisoes da Fase 0 em `docs/FINAL_SIMULATIONS_MIGRATION_PLAN.md`, principalmente tabela/rota final, status, RLS com `app_users`, estrategia de documentos/uploads e formulas fiscais minimas antes de criar qualquer migration.

### 2026-07-09 - Ajuste do autocomplete de produto na calculadora

- Ajustado o clique nas sugestoes preliminares de NCM exibidas abaixo de `Nome do produto`.
- Ao selecionar uma sugestao pelo autocomplete do produto, o campo `Nome do produto` agora recebe a descricao completa do item selecionado.
- O campo `HS Code ou NCM sugerido` continua recebendo o codigo NCM selecionado.
- Ao selecionar uma sugestao diretamente pelo campo NCM, o comportamento permanece restrito ao NCM, sem sobrescrever o nome do produto.

Arquivos principais:

- `src/components/calculator/CalculatorClient.tsx`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.

Nao foi possivel validar ainda:

- Teste manual do clique no browser, porque a navegacao para `/app/calculadora` redirecionou para `/login` nesta sessao.

Proxima etapa recomendada:

- Testar logado como cliente: digitar `garra`, clicar em `Garrafas térmicas e outros recipientes isotérmicos` e confirmar que o input `Nome do produto` recebe a descricao completa.

### 2026-07-09 - Reset real do botao Nova cotacao

- Ajustado o botao/aba `Nova cotação` da calculadora para iniciar uma cotacao limpa quando clicado.
- O reset limpa produto, NCM, fornecedor, arquivos selecionados, mensagens, resultado calculado e `editingQuoteId`.
- `Cancelar` continua voltando para o historico, mas agora reaproveita a mesma rotina de reset.
- `Refazer cálculo` continua preservando os dados da cotacao atual.
- `tsconfig.json` passou a excluir a pasta local nao versionada `temp`, que estava entrando no typecheck apesar de nao pertencer ao app principal.

Arquivos principais:

- `src/components/calculator/CalculatorClient.tsx`
- `tsconfig.json`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- Browser local em `/app/calculadora` confirmou que `Nova cotação` deixa a Etapa 1 visivel e o campo de produto limpo.

Nao foi possivel validar ainda:

- Reproducao manual exata do clique partindo de um resultado recem-calculado, porque a pagina recarregou ja sem o bloco de resultado antes do teste.

Proxima etapa recomendada:

- Fazer uma cotacao completa, chegar ao resultado e clicar `Nova cotação` para confirmar que volta ao formulario limpo.

### 2026-07-09 - Configuracao dinamica do fator RPX

- Criada migration incremental para a tabela `public.config`.
- A tabela `config` usa `key`, `value`, `description`, timestamps e RLS admin-only.
- Inserido seed inicial `key = import_factor`, `value = 1.8`.
- Criada camada server-side de configuracoes com fallback controlado para `1.8`.
- Criada rota admin `/admin/configuracoes` para listar, criar e editar configuracoes.
- A chave fica travada apos a criacao; `import_factor` valida valor numerico decimal positivo.
- Adicionado item `Configurações` no menu administrativo.
- O salvamento de cotacao agora busca `import_factor` no servidor, ignora o `rpxFactor` vindo do client, recalcula a cotacao e salva o snapshot em `quotes.rpx_factor`.
- `direct_import_factor = 2.2` foi mantido independente e fora do escopo.
- O detalhe admin da cotacao passou a exibir `Dólar usado` e `Fator de importação usado`.
- A area cliente continua sem exibir fator ou configuracoes.
- Ajustado fallback quando a migration ainda nao foi aplicada: `/admin/configuracoes` nao quebra mais se `public.config` nao existir e exibe aviso de migration pendente.
- Enquanto `public.config` nao existir, novas cotacoes continuam usando fallback `1.8` para `import_factor`.
- Migration `20260709180000_create_config_table.sql` aplicada no Supabase remoto apos aprovacao explicita.

Arquivos principais:

- `supabase/migrations/20260709180000_create_config_table.sql`
- `src/lib/config/app-config.ts`
- `src/lib/actions/config.ts`
- `src/app/admin/configuracoes/page.tsx`
- `src/lib/actions/client-quotes.ts`
- `src/components/calculator/CalculatorClient.tsx`
- `src/app/admin/cotacoes/[id]/page.tsx`
- `src/lib/navigation.ts`
- `docs/DATABASE_MODEL.md`
- `docs/AUTH_AND_PERMISSIONS.md`
- `docs/ROUTES_AND_SCREENS.md`
- `docs/TECH_STACK.md`
- `docs/spec-cruds.md`
- `docs/especificacao-calculadora.md`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- Browser local autenticado em `/admin/configuracoes` confirmou aviso amigavel quando `public.config` ainda nao existe.
- Apos aplicar a migration, browser local autenticado confirmou `import_factor = 1.8` listado em `/admin/configuracoes`.

Nao foi possivel validar ainda:

- Teste manual de admin alterando `import_factor` e criando nova cotacao ainda pendente.
- `npm run build` nao foi executado porque o dev server esta ativo.

Proxima etapa recomendada:

- Aplicar a migration quando aprovado, testar `/admin/configuracoes`, alterar `import_factor` para um valor temporario e criar nova cotacao confirmando snapshot em `quotes.rpx_factor`.

### 2026-07-09 - Feedback e loading do upload na calculadora

- Ajustado o upload da calculadora para preservar o `fileType` original durante a compressao de imagens.
- Ajustado o arquivo comprimido para preservar explicitamente nome, MIME type e `lastModified` originais antes de enviar ao servidor.
- A validacao server-side de uploads de cotacao passou a aceitar MIME `image/*` quando a extensao e uma imagem permitida, evitando falso bloqueio de PNG/JPG/WEBP/GIF apos compressao.
- A mensagem de falha parcial agora exibe o motivo retornado por arquivo.
- Falhas de Storage e de registro em `uploads` passaram a retornar mensagens menos genericas.
- Adicionado loading intermediario entre o recolhimento da Etapa 1 e a exibicao do resultado.
- O loading informa fases como atualizacao de parametros, criacao da cotacao e envio de arquivos.

Arquivos principais:

- `src/components/calculator/CalculatorClient.tsx`
- `src/lib/uploads/actions.ts`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.

Nao foi possivel validar ainda:

- Novo teste manual de upload com os mesmos arquivos da falha parcial.

Proxima etapa recomendada:

- Repetir o envio com imagens PNG/JPG e confirmar se os arquivos aparecem em `uploads` e no detalhe admin da cotacao.

### 2026-07-09 - Upload real de arquivos na criacao de cotacao

- A calculadora em `/app/calculadora` passou a usar upload real para os campos de arquivos da cotacao.
- Instalada a dependencia `browser-image-compression`.
- `Imagens do produto` aceita ate 5 arquivos validos, imagens ou PDF.
- `Foto do cartao ou contato do fornecedor` aceita ate 5 arquivos validos, imagens ou PDF.
- Imagens sao comprimidas no navegador antes do upload com limite visual/operacional voltado a fotos de celular.
- PDF nao e comprimido.
- Cada arquivo final e limitado a 6MB.
- DOC, XLS, ZIP, SVG, JS e demais tipos fora da allowlist sao bloqueados nessa tela.
- A validacao do fornecedor agora aceita nome, e-mail e telefone completos ou pelo menos um arquivo valido em `quote_supplier_contact`.
- Arquivos recusados por tipo, tamanho ou erro de compressao nao contam para a validacao do fornecedor.
- O fluxo de `Fazer calculo` agora valida formulario e arquivos, cria a quote e, depois de receber `quote_id`, envia os arquivos.
- Os uploads sao gravados em `uploads` com `quote_id`, `simulation_id = null` e contextos:
  - `quote_product_images`;
  - `quote_supplier_contact`.
- Paths usados:
  - `quotes/{quote_id}/product-images/{upload_id}/{safe_filename}`;
  - `quotes/{quote_id}/supplier-contact/{upload_id}/{safe_filename}`.
- Se a quote for criada e algum upload falhar, a quote e mantida e a UI informa quais arquivos nao foram enviados.
- `product_image_urls` e `supplier_contact_image_urls` permanecem como campos legados, sem remocao e sem backfill, e nao sao mais a fonte principal do novo fluxo.
- O detalhe admin da cotacao passou a exibir grupos separados:
  - `Arquivos do produto`;
  - `Arquivos do fornecedor/contato`.
- O admin visualiza/baixa os arquivos por modal compartilhado e signed URL sob demanda.
- Nenhuma migration, bucket, RLS ou estrutura de tabela foi alterada nesta rodada.

Arquivos principais:

- `package.json`
- `package-lock.json`
- `src/components/calculator/CalculatorClient.tsx`
- `src/lib/uploads/actions.ts`
- `src/app/admin/cotacoes/[id]/page.tsx`
- `docs/DATABASE_MODEL.md`
- `docs/especificacao-calculadora.md`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.

Nao foi possivel validar ainda:

- Upload manual de imagem/PDF na calculadora.
- Compressao visual de imagem grande.
- Visualizacao dos arquivos no detalhe admin da cotacao.
- `npm run build` nao sera executado com dev server ativo.

Proxima etapa recomendada:

- Testar manualmente cotacao com imagem grande, PDF menor que 6MB, sexto arquivo bloqueado, fornecedor sem dados mas com arquivo valido, fornecedor sem dados e sem arquivo bloqueado, e preview no detalhe admin.

### 2026-07-09 - Correcao do logout em producao

- Corrigido o fluxo de `POST /logout` para evitar HTTP 405 apos encerrar a sessao.
- A causa raiz era o `NextResponse.redirect("/")` no route handler de logout usando status padrao 307.
- Como o menu usa `<form action="/logout" method="post">`, o 307 preservava o metodo POST e fazia o navegador tentar `POST /`, que nao existe e gerava 405.
- `/logout` agora redireciona com HTTP 303, convertendo o proximo request para GET na landing page publica.
- O menu de conta foi preservado e o fluxo continua compativel para Admin e Cliente.

Arquivos principais:

- `src/app/logout/route.ts`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- `curl -X POST http://localhost:3000/logout` confirmou `303 See Other` com `Location: http://localhost:3000/`.

Nao foi possivel validar ainda:

- Clique manual de logout em producao apos novo deploy.

Proxima etapa recomendada:

- Publicar a correcao na Vercel e testar logout com usuario cliente e admin.

### 2026-07-09 - Arquivos e status na listagem de simulacoes do cliente

- `/app/simulacoes` passou a usar o mesmo padrao visual/funcional de arquivos da listagem admin.
- A antiga celula admin foi extraida para `src/components/uploads/UploadFilesCell.tsx`.
- Admin e Cliente agora usam o mesmo componente visual/modal, mas com actions diferentes de signed URL.
- Criada action `getClientUploadSignedUrl(uploadId)`.
- A action cliente valida role `client`, exige `client_id`, confirma que o upload tem `simulation_id` e que a simulacao pertence ao cliente logado.
- `getClientSimulations` passou a buscar uploads em segunda query, sem N+1.
- Os uploads do cliente sao filtrados por `simulation_id in (...)`, `context = simulation_result` e `deleted_at is null`, agrupados por `simulation_id` e anexados às rows.
- A segunda query de metadados de uploads usa service role apenas no servidor, depois que as simulacoes ja foram filtradas por `client_id`, porque a RLS de `uploads` nao libera select direto para cliente nesta fase.
- A listagem do cliente nao gera signed URL no carregamento.
- A coluna `Arquivo` usa somente `uploads`, sem fallback legado `quote_file_url`, `storage_path` ou `file_name`.
- Sem arquivo, exibe `Ainda não disponível`.
- Com um arquivo, exibe link do arquivo; com multiplos, exibe primeiro arquivo e `+N arquivos` com expansao inline.
- O clique abre modal compartilhado com preview de PDF/imagem/TXT e fallback de download para formatos sem preview.
- A coluna `Status` passou a usar `StatusBadge`, seguindo o padrao visual admin.
- Nenhuma migration, bucket, estrutura de tabela ou UI de detalhe admin foi alterada nesta rodada.

Arquivos principais:

- `src/components/uploads/UploadFilesCell.tsx`
- `src/components/admin/SimulationFilesCell.tsx`
- `src/lib/uploads/actions.ts`
- `src/lib/client/quotes.ts`
- `src/lib/client/types.ts`
- `src/app/app/simulacoes/page.tsx`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- Dev server recompilou `/app/simulacoes` e `/admin/simulacoes` e respondeu HTTP 200 apos a extracao do componente compartilhado.

Nao foi possivel validar ainda:

- Clique manual no modal da area cliente.
- Tentativa manual de acesso a upload de outro cliente manipulando `uploadId`.
- `npm run build` nao sera executado com dev server ativo.

Proxima etapa recomendada:

- Testar manualmente `/app/simulacoes` com simulacoes sem arquivo, com PDF, imagem, formato sem preview e multiplos arquivos; validar que cliente nao abre upload de outra conta.

### 2026-07-09 - Arquivos na listagem administrativa de simulacoes

- `/admin/simulacoes` passou a exibir arquivos vinculados pela tabela `uploads` na coluna `Arquivo`.
- A query `getAdminSimulations` agora busca uploads da pagina atual em uma segunda query, sem N+1.
- Os uploads sao filtrados por `simulation_id`, `context = simulation_result` e `deleted_at is null`.
- Os metadados sao agrupados por `simulation_id` em TypeScript e anexados a cada row.
- A listagem nao gera signed URLs no carregamento da tabela.
- O clique em arquivo chama `getUploadSignedUrl(uploadId)` sob demanda e abre a URL em nova aba.
- O clique em arquivo agora abre visualizacao em modal, seguindo o padrao do detalhe da simulacao; formatos sem preview exibem acao para baixar.
- A coluna mostra `Pendente` quando nao ha uploads.
- Com um upload, mostra link direto com o nome do arquivo.
- Com multiplos uploads, mostra o primeiro link e `+N arquivos` com expansao inline.
- A coluna nao usa fallback legado `quote_file_url`, `storage_path` ou `file_name`.
- A UI de detalhe de simulacao nao foi alterada nesta rodada.

Arquivos principais:

- `src/lib/admin/queries.ts`
- `src/app/admin/simulacoes/page.tsx`
- `src/components/admin/SimulationFilesCell.tsx`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.

Nao foi possivel validar ainda:

- Clique manual nos links da listagem.
- `npm run build` nao foi executado porque o dev server esta ativo.

Proxima etapa recomendada:

- Testar manualmente simulacao sem upload, com um upload e com multiplos uploads; confirmar abertura por signed URL e atualizacao da listagem apos excluir/substituir no detalhe.

### 2026-07-09 - Visualizacao de anexos em modal

- O componente `UploadsCard` ganhou acao `Visualizar` por arquivo.
- A visualizacao gera signed URL temporaria e abre modal sem sair da tela de simulacao.
- PDFs e arquivos `.txt` sao exibidos em iframe.
- Imagens comuns sao exibidas no modal.
- Formatos sem preview confiavel no navegador exibem mensagem e botao para baixar.
- Nenhuma migration, policy, tabela, rota ou regra de permissao foi alterada nesta rodada.

Arquivos principais:

- `src/components/uploads/UploadsCard.tsx`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- Dev server recompilou `/admin/simulacoes/[id]` e respondeu HTTP 200.

Nao foi possivel validar ainda:

- Preview visual no navegador com todos os tipos permitidos.

Proxima etapa recomendada:

- Testar manualmente `Visualizar` com PDF, imagem e TXT; para DOC/DOCX/XLS/XLSX/ZIP, confirmar exibicao da mensagem de preview indisponivel e download.

### 2026-07-09 - Uploads administrativos com Supabase Storage

- Criada migration `20260709134047_create_uploads_table_and_storage_bucket.sql`.
- A migration configura bucket privado `app-uploads` com limite de 10MB.
- Criada tabela unica `uploads` com FKs reais opcionais:
  - `simulation_id -> public.simulations(id)`;
  - `quote_id -> public.quotes(id)`.
- Adicionado CHECK para garantir exatamente um dono entre `simulation_id` e `quote_id`.
- Adicionados indices por dono, contexto, data, soft delete e unicidade de `(bucket, path)`.
- Adicionadas policies RLS para admin na tabela `uploads` e em `storage.objects` para o bucket `app-uploads`.
- Criada camada server-side `src/lib/uploads/actions.ts` com:
  - `listSimulationUploads`;
  - `listQuoteUploads`;
  - `uploadSimulationFile`;
  - `uploadQuoteFile`;
  - `getUploadSignedUrl`;
  - `deleteUpload`;
  - `replaceUpload`.
- Implementadas validacoes de arquivo no servidor: limite de 10MB, allowlist de MIME/extensao, bloqueio de extensoes perigosas, sanitizacao de nome e paths seguros.
- Criado componente reutilizavel `UploadsCard` para listar, enviar, baixar por signed URL, substituir e excluir arquivos.
- `/admin/simulacoes/[id]` passou a usar upload real com `context = simulation_result`.
- O campo textual `URL ou caminho do arquivo` foi removido do formulario de simulacao.
- Campos antigos `file_name`, `storage_path` e `quote_file_url` foram mantidos como legado, sem remocao de coluna e sem backfill automatico.
- A UI de `/admin/cotacoes/[id]` nao foi alterada nesta rodada; apenas as funcoes server-side de quote ficaram preparadas.
- Nao foi executado `supabase db push` no remoto.

Arquivos principais:

- `supabase/migrations/20260709134047_create_uploads_table_and_storage_bucket.sql`
- `src/lib/uploads/actions.ts`
- `src/components/uploads/UploadsCard.tsx`
- `src/app/admin/simulacoes/[id]/page.tsx`
- `src/components/admin/SimulationForm.tsx`
- `src/lib/actions/admin.ts`
- `src/lib/admin/simulation-form-state.ts`
- `docs/DATABASE_MODEL.md`
- `docs/AUTH_AND_PERMISSIONS.md`
- `docs/ROUTES_AND_SCREENS.md`
- `docs/TECH_STACK.md`
- `docs/spec-cruds.md`
- `docs/especificacao-calculadora.md`
- `docs/CURRENT_STATUS.md`
- `docs/FOLDER_STRUCTURE.md`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- `npm run build` aprovado.

Nao foi possivel validar ainda:

- Upload/download/exclusao/substituicao no browser, porque a migration ainda nao foi aplicada ao Supabase remoto/local.
- Regras RLS/Storage em runtime, pelo mesmo motivo.

Proxima etapa recomendada:

- Revisar a migration e, quando aprovado, aplicar com `supabase db push`; em seguida testar upload de PDF/XLSX/DOCX/imagem, bloqueios de tamanho/tipo, signed URL, substituicao e exclusao na tela de detalhe da simulacao.

### 2026-06-23 - Sugestao de NCM pelo nome do produto

- A calculadora passou a sugerir NCMs tambem a partir do campo `Nome do produto`.
- A implementacao reutiliza a base local existente `public/data/ncm.json`, ja carregada para o autocomplete do campo `HS Code ou NCM sugerido`.
- As sugestoes priorizam descricoes oficiais que contenham os termos digitados no nome do produto, com bonus quando a correspondencia aparece no inicio da descricao.
- Quando nao ha correspondencia especifica, a lista cai em opcoes genericas com descricao `Outros`, mantendo o cliente livre para selecionar ou editar manualmente.
- Selecionar uma sugestao pelo nome do produto preenche o campo `HS Code ou NCM sugerido` e preserva o aviso de classificacao preliminar.
- A lista de sugestoes do nome do produto e ocultada apos selecionar uma opcao, voltando a aparecer apenas se o nome do produto for alterado novamente.
- Nenhum calculo, persistencia, migration, action, query, rota ou estrutura de banco foi alterado.

Arquivos principais:

- `src/components/calculator/CalculatorClient.tsx`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- `npm run build` aprovado.
- Teste manual em `http://localhost:3005/app/calculadora` confirmou sugestao `9617.00.10` para `garrafa termica inox` e preenchimento do campo NCM ao clicar.
- Teste manual confirmou fallback com opcoes `Outros` quando o nome do produto nao encontra correspondencia especifica.

Nao foi possivel validar ainda:

- Precisao fiscal das sugestoes; a classificacao segue preliminar e sujeita a validacao.

Proxima etapa recomendada:

- Evoluir futuramente para uma base curada de aliases comerciais por produto quando houver volume real de cotacoes.

### 2026-06-18 - Layout admin com header e sidebar fixos

- Area administrativa passou a usar variante `admin` do `AppShell`.
- Header admin ficou fixo no topo com altura consistente.
- Sidebar admin ficou fixa a esquerda em desktop, preservando links ativos e titulo `Painel Administrativo`.
- Conteudo admin passou a ocupar melhor a largura disponivel com `w-full` e padding responsivo, sem `max-w-7xl mx-auto`.
- Mobile preserva o menu/drawer atual e nao exibe sidebar fixa.
- Area do cliente permanece no layout anterior/client.
- `/admin/usuarios` passou a exibir o botao `Novo usuário`.
- `docs/AUTH_AND_PERMISSIONS.md` foi atualizado com rotas admin granulares.
- Nenhuma query, action, migration, regra de auth/RLS, coluna, filtro, paginacao, calculo ou fluxo de cliente foi alterado.

Arquivos principais:

- `src/components/layout/AppShell.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/usuarios/page.tsx`
- `docs/AUTH_AND_PERMISSIONS.md`
- `docs/UI_UX_GUIDE.md`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- `npm run build` aprovado.
- Teste manual desktop no browser em `/admin/clientes`, `/admin/cotacoes`, `/admin/simulacoes` e `/admin/usuarios` confirmou header fixo, sidebar fixa, ausencia de overflow horizontal da pagina e tabelas com rolagem no proprio container quando necessario.
- Teste manual desktop no browser em telas de detalhe/formulario (`/admin/cotacoes/[id]`, `/admin/simulacoes/[id]`, `/admin/usuarios/[id]`) confirmou que o header fixo nao cobre o conteudo e que o padding superior do `main` esta aplicado.
- Inspecao responsiva confirmou que a sidebar fixa usa `hidden lg:block`, permanecendo fora do mobile, enquanto o menu/drawer existente segue disponivel via `MobileNav`.
- Teste rapido da area cliente tentou abrir `/app` e `/app/calculadora` com sessao admin e confirmou redirecionamento para `/admin/dashboard`, preservando a segregacao por role.
- `git diff --check` aprovado.

Nao foi possivel validar ainda:

- Renderizacao autenticada da area cliente com usuario `client` nao foi executada nesta rodada porque a sessao local ativa e de admin. A branch client do `AppShell` foi preservada e validada por typecheck/build.

Proxima etapa recomendada:

- Seguir para o proximo bloco funcional aprovado, mantendo o novo padrao de layout admin.

### 2026-06-18 - Usuarios admin padronizado

- `/admin/usuarios` passou a seguir o padrao visual e funcional do CRUD de Clientes.
- Listagem administrativa agora gerencia somente `app_users.role = 'admin'`.
- Adicionados filtros ocultaveis, totalizador, paginacao, ordenacao por whitelist, status com badge e coluna de acoes.
- Criadas rotas `/admin/usuarios/novo` e `/admin/usuarios/[id]`.
- Criacao de admin agora usa formulario dedicado com senha obrigatoria, confirmacao, validacao inline e e-mail duplicado no campo E-mail.
- Edicao permite atualizar nome, e-mail, status e senha opcional.
- Nome/e-mail/senha sao sincronizados com Supabase Auth quando o usuario usa `auth_provider = 'supabase'`.
- Inativacao de admin usa `app_users.status = 'inactive'`, sem preencher `deleted_at` e sem excluir o usuario do Supabase Auth.
- Reativacao volta `app_users.status = 'active'`.
- Auto-inativacao do admin logado e bloqueada no servidor com mensagem amigavel.
- Queries administrativas validam role admin no servidor e Server Actions validam acesso admin antes de persistir.
- Nenhuma migration foi criada e o modulo de Clientes, Cotacoes e Simulacoes nao foi alterado.

Arquivos principais:

- `src/app/admin/usuarios/page.tsx`
- `src/app/admin/usuarios/novo/page.tsx`
- `src/app/admin/usuarios/[id]/page.tsx`
- `src/components/admin/AdminUserFilters.tsx`
- `src/components/admin/AdminUserForm.tsx`
- `src/components/admin/AdminUserRowActions.tsx`
- `src/lib/admin/admin-user-form-state.ts`
- `src/lib/admin/queries.ts`
- `src/lib/actions/admin.ts`
- `docs/ROUTES_AND_SCREENS.md`
- `docs/AUTH_AND_PERMISSIONS.md`
- `docs/spec-cruds.md`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- `npm run build` aprovado.
- Teste manual em `http://localhost:3005/admin/usuarios` confirmou listagem real, filtros ocultaveis, totalizador, ordenacao por whitelist, status com badge e acoes.
- Teste manual em `http://localhost:3005/admin/usuarios/novo` confirmou formulario dedicado, validacao inline e preservacao de dados nao sensiveis.
- Teste manual de e-mail duplicado confirmou erro no campo E-mail e limpeza de senha/confirmacao.
- Teste manual em `http://localhost:3005/admin/usuarios/[id]` confirmou edicao com senha opcional e sincronizacao sem alterar senha quando vazia.
- Teste manual de inativacao confirmou `status = inactive`, mensagem de sucesso e acao de reativar.
- Teste manual de reativacao confirmou retorno para `status = active`.
- Teste manual de auto-inativacao confirmou bloqueio com mensagem amigavel e conta logada permanecendo ativa.

Nao foi possivel validar ainda:

- Paginacao depende de haver mais de 20 usuarios admin no ambiente.
- Login real com um admin inativado nao foi executado para evitar interromper acesso de usuarios existentes; o bloqueio por `status !== active` ja existe em `getSessionProfile()` e foi preservado.

Proxima etapa recomendada:

- Avancar para o proximo CRUD administrativo aprovado.

### 2026-06-18 - Simulacoes admin basico

- `/admin/simulacoes` deixou de ser placeholder e passou a listar registros reais de `simulations`.
- Listagem administrativa agora possui filtros ocultaveis por cliente, produto, HS/NCM, fornecedor, status e periodo.
- Adicionados totalizador, paginacao, ordenacao por whitelist em colunas reais de `simulations`, badge de status e coluna de acoes.
- Criadas rotas `/admin/simulacoes/nova` e `/admin/simulacoes/[id]`.
- Criacao administrativa ficou limitada aos campos existentes: cliente, cotacao opcional, titulo, status, observacoes e referencia de arquivo.
- Detalhe/edicao permite atualizar status, observacoes para o cliente e URL/caminho de arquivo existente.
- Dados ricos de produto, FOB, fornecedor e calculo aparecem quando a simulacao possui cotacao vinculada.
- Queries administrativas validam role admin no servidor e Server Actions validam acesso admin antes de persistir.
- Nenhuma migration, upload real, exclusao/inativacao de simulacao ou alteracao no fluxo do cliente/calculadora foi feita.

Arquivos principais:

- `src/app/admin/simulacoes/page.tsx`
- `src/app/admin/simulacoes/nova/page.tsx`
- `src/app/admin/simulacoes/[id]/page.tsx`
- `src/components/admin/SimulationFilters.tsx`
- `src/components/admin/SimulationForm.tsx`
- `src/lib/admin/simulation-form-state.ts`
- `src/lib/admin/queries.ts`
- `src/lib/actions/admin.ts`
- `docs/ROUTES_AND_SCREENS.md`
- `docs/spec-cruds.md`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- `npm run build` aprovado.
- `git diff --check` aprovado.
- Teste manual em `http://localhost:3005/admin/simulacoes` confirmou listagem real, totalizador, filtros ocultaveis, ordenacao por `title`, status com badge e links de acao.
- Teste manual em `http://localhost:3005/admin/simulacoes/[id]` confirmou detalhe com resumo, dados da cotacao vinculada e formulario restrito de edicao.
- Teste manual em `http://localhost:3005/admin/simulacoes/nova` confirmou formulario de criacao basica e validacao inline sem criar registro.
- Teste rapido em `http://localhost:3005/admin/clientes` confirmou que o CRUD de Clientes segue renderizando com botao Novo e filtros.

Nao foi possivel validar ainda:

- Paginacao depende de haver mais de 20 simulacoes no ambiente.
- Upload real de arquivo nao foi validado porque segue fora do escopo desta fase.

Proxima etapa recomendada:

- Avancar para o proximo CRUD administrativo aprovado.

### 2026-06-18 - Cotações admin read-only padronizado

- `/admin/cotacoes` passou a seguir o padrão visual e funcional do CRUD de Clientes, sem botão `Novo`.
- Listagem administrativa de cotações agora possui filtros ocultáveis, totalizador, paginação, ordenação por whitelist, status/situação com badge e ação `Abrir`.
- Ordenação foi limitada a colunas reais e seguras de `quotes`; cliente ficou fora da ordenação nesta fase.
- Criada rota `/admin/cotacoes/[id]` com detalhe administrativo read-only da cotação.
- Detalhe exibe produto, HS/NCM, valores calculados, cliente, fornecedor, datas, situação, simulações vinculadas e URLs/metadados de imagens quando existirem.
- Queries administrativas de cotações passaram a validar role admin no servidor.
- Nenhuma migration foi criada e nenhum fluxo da área do cliente/calculadora foi alterado.

Arquivos principais:

- `src/app/admin/cotacoes/page.tsx`
- `src/app/admin/cotacoes/[id]/page.tsx`
- `src/components/admin/QuoteFilters.tsx`
- `src/components/admin/CrudHeaderWithFilters.tsx`
- `src/lib/admin/queries.ts`
- `docs/spec-cruds.md`
- `docs/ROUTES_AND_SCREENS.md`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- `npm run build` aprovado.
- `git diff --check` aprovado.

Nao foi possivel validar ainda:

- Paginacao depende de haver mais de 20 cotacoes no ambiente.
- Teste manual completo no navegador em `/admin/cotacoes`, `/admin/cotacoes/[id]` e `/admin/clientes` nao foi concluido porque a sessao do navegador nao estava autenticada como admin no Supabase real. O fallback mock em servidor auxiliar nao conseguiu renderizar as paginas administrativas dinamicas porque essas queries exigem configuracao Supabase.

Proxima etapa recomendada:

- Padronizar Simulações admin usando dados reais de `simulations`.

### 2026-06-18 - Atualizacao documental do estado real do projeto

- Documentacao principal foi atualizada para refletir Supabase real, autenticacao funcionando, `app_users` como fonte de verdade, persistencia de cotacoes em `quotes`, solicitacoes em `simulations` e CRUD administrativo de Clientes completo.
- `README.md`, `docs/CURRENT_STATUS.md`, `docs/AI_CONTEXT.md`, `docs/FOLDER_STRUCTURE.md`, `docs/ROUTES_AND_SCREENS.md`, `docs/DATABASE_MODEL.md` e `docs/AUTH_AND_PERMISSIONS.md` deixaram de tratar o estado inicial de 12/06 como atual.
- Docs opcionais foram ajustados apenas onde havia conflito relevante com o estado atual.
- Nenhum codigo de aplicacao, migration ou configuracao de build/deploy foi alterado nesta entrega.

Arquivos principais:

- `README.md`
- `docs/CURRENT_STATUS.md`
- `docs/AI_CONTEXT.md`
- `docs/FOLDER_STRUCTURE.md`
- `docs/ROUTES_AND_SCREENS.md`
- `docs/DATABASE_MODEL.md`
- `docs/AUTH_AND_PERMISSIONS.md`
- `docs/TECH_STACK.md`
- `docs/API_AND_SUPABASE_PLAN.md`
- `docs/UI_UX_GUIDE.md`
- `docs/FEATURES_BACKLOG.md`
- `state.md`

Validado:

- Revisao local dos documentos atualizados.
- `git diff --check` aprovado.

Nao foi possivel validar ainda:

- Nao aplicavel a runtime, pois a entrega e exclusivamente documental.

Proxima etapa recomendada:

- Refinar os CRUDs administrativos de Cotacoes, Usuarios e Simulacoes seguindo `docs/spec-cruds.md`.

### 2026-06-18 - Validacao inline no formulario administrativo de Clientes

- Formulario de novo cliente passou a preservar dados nao sensiveis quando o submit falha.
- Senha e confirmacao sao limpas apos erro por seguranca, mantendo os erros inline visiveis.
- Server Actions de criacao e edicao de cliente passaram a retornar estado estruturado para erros previsiveis.
- Validacao server-side agora exibe erros por campo para nome, e-mail, senha e confirmacao.
- E-mail duplicado e tratado em duas camadas:
  - checagem previa em `app_users` com `deleted_at is null`;
  - fallback para erros de Supabase Auth, Postgres e constraint unica.
- Formulario de edicao manteve senha opcional e valida senha apenas quando um dos campos de senha for preenchido.
- Campos com erro ganharam destaque visual, texto inline e atributos de acessibilidade.
- `docs/spec-cruds.md` foi atualizado com o padrao real de validacao inline nos CRUDs administrativos.

Arquivos principais:

- `src/lib/actions/admin.ts`
- `src/lib/admin/client-form-state.ts`
- `src/components/admin/ClientForm.tsx`
- `src/components/ui/FormField.tsx`
- `docs/spec-cruds.md`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- Teste local no navegador confirmou:
  - campos obrigatorios com erro inline;
  - e-mail invalido com erro inline;
  - senha curta e confirmacao diferente com erro inline;
  - preservacao de nome, empresa, e-mail e telefone apos erro;
  - limpeza de senha e confirmacao apos erro;
  - e-mail duplicado no cadastro exibido no campo E-mail;
  - edicao com senha opcional;
  - edicao com senha invalida exibindo erro inline;
  - e-mail duplicado na edicao exibido no campo E-mail.

Nao foi possivel validar ainda:

- Fluxo de erro por constraint unica vindo diretamente do banco sem a checagem previa, pois isso exigiria simular corrida de concorrencia ou alterar o banco durante o teste.

Proxima etapa recomendada:

- Replicar o mesmo padrao de formulario com `fieldErrors` nos proximos CRUDs administrativos.

### 2026-06-18 - Data e hora na coluna Cadastro dos CRUDs

- Coluna `Cadastro` no CRUD administrativo de Clientes passou a exibir data e hora.
- Formato padrao definido: `dd/mm/aaaa - HH:mm`.
- `docs/spec-cruds.md` foi atualizado para tornar esse formato padrao nos proximos CRUDs.

Arquivos principais:

- `src/app/admin/clientes/page.tsx`
- `docs/spec-cruds.md`
- `state.md`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- Teste local no navegador confirmou exibicao no formato com data e hora.

Nao foi possivel validar ainda:

- Deploy em producao desta mudanca pontual.

Proxima etapa recomendada:

- Reutilizar o mesmo formato em qualquer coluna futura de data de cadastro.

### 2026-06-18 - Ordenacao e inativacao padronizada no CRUD de Clientes

- Modulo administrativo de Clientes passou a ter ordenacao por coluna na listagem.
- Ordenacao usa query params `sort` e `direction`, com whitelist server-side antes de chegar ao Supabase.
- Whitelist validada contra os campos reais da camada de dados:
  - `company_name`;
  - `contact_name`;
  - `contact_email`;
  - `source`;
  - `status`;
  - `created_at`.
- Aliases publicos de sort foram mantidos seguros:
  - `responsible_name` -> `contact_name`;
  - `email` -> `contact_email`.
- Links de ordenacao, filtros, paginacao e inativacao preservam o estado da listagem quando aplicavel.
- Acao da linha mudou de `Excluir` para `Inativar`, mantendo soft delete em `clients` e inativacao do usuario vinculado em `app_users`.
- Status passou a usar o componente compartilhado `StatusBadge`.
- Queries administrativas de Clientes agora validam perfil admin server-side.
- `docs/spec-cruds.md` foi atualizado para refletir exatamente o padrao implementado.

Arquivos principais:

- `src/app/admin/clientes/page.tsx`
- `src/components/admin/ClientFilters.tsx`
- `src/components/admin/ClientRowActions.tsx`
- `src/components/ui/DataTable.tsx`
- `src/components/ui/StatusBadge.tsx`
- `src/lib/admin/queries.ts`
- `src/lib/actions/admin.ts`
- `docs/spec-cruds.md`
- `state.md`

Validado:

- Whitelist de ordenacao revisada contra schema/types/actions atuais.
- `npm run typecheck` aprovado.
- `npm run lint` aprovado.
- `npm run build` aprovado.
- Teste local no navegador confirmou listagem, ordenacao por URL, modal de inativacao e badge de status.

Nao foi possivel validar ainda:

- Inativacao com submit real nao foi executada para evitar alterar dados de cliente durante o teste.
- Paginacao para pagina 2 depende de haver mais de 20 clientes ativos no ambiente.

Proxima etapa recomendada:

- Replicar o padrao em Cotacoes, Simulacoes e Usuarios quando esses CRUDs forem refinados.

### 2026-06-18 - Espacamento padrao abaixo dos filtros de CRUD

- `CrudHeaderWithFilters` passou a aplicar margem inferior padrao quando o painel de filtros esta aberto.
- O ajuste evita que filtros fiquem grudados no totalizador/listagem em Clientes e nos proximos CRUDs que reutilizarem o componente.

Arquivos principais:

- `src/components/admin/CrudHeaderWithFilters.tsx`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- Teste local no navegador confirmou gap de 32px entre filtros e totalizador.

Nao foi possivel validar ainda:

- Deploy em producao desta mudanca pontual.

Proxima etapa recomendada:

- Manter este espaçamento como padrao nos proximos CRUDs administrativos.

### 2026-06-18 - Spec dos CRUDs administrativos

- `docs/spec-cruds.md` foi atualizado como especificacao oficial dos CRUDs administrativos.
- O modulo de Clientes foi documentado como referencia tecnica, visual e funcional para proximos CRUDs.
- A spec cobre estrutura de arquivos, listagem, filtros, acoes por linha, criacao, edicao, soft delete, detalhes, dados/actions, Supabase, padrao visual e regras para novos modulos.
- Nenhum modulo novo foi implementado nesta etapa.

Arquivos principais:

- `docs/spec-cruds.md`

Validado:

- Revisao local do documento gerado.
- `git diff --check` sem problemas.

Nao foi possivel validar ainda:

- Nao aplicavel a runtime, pois a entrega e apenas documental.

Proxima etapa recomendada:

- Usar esta spec como base antes de evoluir os CRUDs de Cotacoes, Usuarios e Simulacoes.

### 2026-06-17 - Totalizador e paginacao em Clientes

- Modulo administrativo de Clientes passou a buscar registros paginados no banco.
- Listagem exibe sempre ate 20 clientes por pagina.
- Totalizador considera os filtros ativos e mostra quantidade total encontrada.
- Rodape de paginacao preserva filtros ao navegar entre paginas.

Arquivos principais:

- `src/app/admin/clientes/page.tsx`
- `src/lib/admin/queries.ts`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- Teste local no navegador confirmou totalizador e exibicao da primeira pagina.

Nao foi possivel validar ainda:

- Navegacao para pagina 2, pois a base local/remota atual tem menos de 20 clientes no filtro testado.
- Deploy em producao desta mudanca pontual.

Proxima etapa recomendada:

- Reaplicar o mesmo padrao de totalizador/paginacao nos proximos CRUDs administrativos.

### 2026-06-17 - Header contextual da sidebar

- Sidebar das areas internas passou a exibir um titulo contextual acima dos menus.
- Usuarios admin veem `Painel Administrativo`.
- Usuarios cliente veem `Area do cliente`.
- Menu mobile recebeu o mesmo titulo contextual ao abrir o drawer.

Arquivos principais:

- `src/components/layout/AppShell.tsx`
- `src/components/layout/MobileNav.tsx`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- Teste local no navegador confirmou `Painel Administrativo` na sidebar admin.

Nao foi possivel validar ainda:

- Visual do drawer mobile apos esta mudanca.
- Deploy em producao desta mudanca pontual.

Proxima etapa recomendada:

- Validar em viewport mobile no proximo ciclo visual.

### 2026-06-17 - Remocao dos menus administrativos futuros

- Itens administrativos ainda nao implementados foram removidos da navegacao.
- Bloco `Em breve` deixou de aparecer no sidebar e no menu mobile.
- Permanecem visiveis apenas os modulos atuais: Dashboard, Clientes, Cotacoes, Simulacoes e Usuarios.

Arquivos principais:

- `src/lib/navigation.ts`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- Teste local no navegador confirmou sidebar sem `Em breve`, `Fornecedores`, `Despachantes` e `Parametros`.

Nao foi possivel validar ainda:

- Deploy em producao desta mudanca pontual.

Proxima etapa recomendada:

- Reintroduzir esses menus apenas quando os respectivos modulos forem implementados.

### 2026-06-17 - Senha no cadastro administrativo de cliente

- Cadastro de novo cliente no painel administrativo passou a exigir `Senha` e `Confirmar senha`.
- Server action de criacao agora valida senha minima e confirmacao antes de salvar.
- Criacao administrativa de cliente agora tambem cria usuario no Supabase Auth e registro vinculado em `app_users` com role `client`.
- Em caso de falha ao criar cliente/app_user, o usuario de Auth criado na tentativa e removido para evitar cadastro orfao.
- Formulario de edicao manteve o comportamento anterior de senha opcional para redefinicao.

Arquivos principais:

- `src/components/admin/ClientForm.tsx`
- `src/app/admin/clientes/novo/page.tsx`
- `src/lib/actions/admin.ts`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- Teste local no navegador confirmou campos obrigatorios `Senha` e `Confirmar senha` em `/admin/clientes/novo`.

Nao foi possivel validar ainda:

- Criacao real de um novo cliente para evitar gerar dados de teste no banco remoto.
- Deploy em producao desta mudanca pontual.

Proxima etapa recomendada:

- Validar um cadastro real controlado no ambiente online apos o proximo deploy.

### 2026-06-17 - Destaque de menu ativo nos modulos internos

- Navegacao lateral e mobile das areas internas passou a aplicar classe `active` no item correspondente a rota atual.
- Itens de modulo tambem ficam ativos em subrotas, mantendo o contexto visual dentro do modulo.
- Dashboard do cliente em `/app` permanece ativo apenas na rota exata, evitando conflito com `/app/calculadora` e `/app/simulacoes`.

Arquivos principais:

- `src/components/layout/NavLinks.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/MobileNav.tsx`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- Teste local no navegador confirmou classe `active` no item `Simulacoes` em `/app/simulacoes`.

Nao foi possivel validar ainda:

- Deploy em producao desta mudanca pontual.

Proxima etapa recomendada:

- Validar navegacao ativa no ambiente online no proximo deploy agrupado.

### 2026-06-17 - Modal de detalhe no historico de cotacoes

- Acao `Abrir` do historico da calculadora passou a exibir a cotacao em modal.
- Modal usa a mesma linguagem visual do resultado da cotacao, com cards de totalizadores, referencia direta em laranja e economia em card verde quando positiva.
- Detalhes de fornecedor e anexos foram mantidos dentro do modal.
- Acao `Copiar` foi removida da listagem do historico.

Arquivos principais:

- `src/components/calculator/CalculatorClient.tsx`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- Teste local no navegador confirmou abertura e fechamento do modal pelo historico.

Nao foi possivel validar ainda:

- Deploy em producao desta mudanca pontual.

Proxima etapa recomendada:

- Validar o modal online no proximo deploy agrupado.

### 2026-06-17 - Cancelamento no modo de edicao da calculadora

- Ao refazer/editar uma cotacao existente na calculadora, a Etapa 1 agora exibe o botao `Cancelar`.
- O cancelamento limpa o modo de edicao, descarta alteracoes nao calculadas e retorna para a aba `Historico`.
- O fluxo de nova cotacao permanece sem botao de cancelamento para manter a tela simples.

Arquivos principais:

- `src/components/calculator/CalculatorClient.tsx`

Validado:

- `npm run typecheck` aprovado.
- `npm run lint` aprovado sem erros.
- Teste local no navegador confirmou o botao `Cancelar` em cotacao carregada para edicao e retorno para a aba `Historico`.

Nao foi possivel validar ainda:

- Deploy em producao desta mudanca pontual.

Proxima etapa recomendada:

- Validar no fluxo online depois do proximo deploy agrupado.

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
