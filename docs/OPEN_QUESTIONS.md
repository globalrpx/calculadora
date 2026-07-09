# Perguntas Abertas - Simulacoes Finais

Data: 2026-07-09

Este documento consolida duvidas encontradas na comparacao entre a arquitetura atual do projeto e a implementacao anterior em `temp/`.

Antes de criar migrations ou implementar codigo, as perguntas marcadas como criticas devem ser respondidas ou assumidas formalmente.

## Decisoes resolvidas na Fase 0

As decisoes abaixo foram assumidas formalmente em 2026-07-09 para permitir a proxima etapa de migrations incrementais.

### Usuarios, permissoes e RLS

- Usar `app_users` como fonte da verdade para usuario, role, status e `client_id`.
- Nao usar `profiles` da implementacao em `temp/` como base de novas tabelas, RLS, actions ou permissoes.
- RLS e permissoes devem seguir o padrao atual do projeto, com `app_users`, usuario ativo, `deleted_at is null`, role `admin` para administracao e isolamento por `client_id`.

### Storage e documentos

- Usar o padrao atual `uploads` + bucket privado `app-uploads`.
- Nao criar bucket `simulation-documents` na V1.
- Documentos de Simulacao Final devem se relacionar com `uploads`.
- Se houver `final_simulation_documents`, a tabela deve guardar metadados/snapshot do documento e apontar para `uploads.id`, sem duplicar o papel de Storage.

### Rotas e fronteira de produto

- Criar o novo modulo em `/admin/simulacoes-finais`.
- Nao substituir `/admin/simulacoes` sem decisao posterior.
- `simulations` continua representando a simulacao/solicitacao basica atual.
- `final_simulations` representara o novo modulo completo de Simulacoes Finais.

### Tabelas e nomes aprovados

- Criar `final_simulations` e tabelas relacionadas para o novo modulo.
- Nao aplicar migrations de `temp/` diretamente.
- Evitar conflito com `simulations` existente.
- Nomes finais recomendados para a proxima etapa:
  - `final_simulations`
  - `final_simulation_items`
  - `final_simulation_tax_lines`
  - `final_simulation_expense_lines`
  - `final_simulation_encomenda_taxes`
  - `final_simulation_documents`
  - `final_simulation_versions`
  - `ncm_codes`
  - `expense_types`
  - `expense_presets`
  - `expense_preset_items`
  - `invoice_parametrizations`
  - `states`

### Status de Simulacao Final

Usar na V1:

- `draft`
- `in_review`
- `needs_adjustment`
- `approved`
- `sent_to_customer`
- `archived`

O status de `simulations` permanece separado.

### Escopo V1

Entram na V1:

- listagem de simulacoes finais;
- criacao/dados principais;
- produtos;
- NCM local/snapshot;
- despesas/tipos/pre-calculo;
- parametrizacao fiscal;
- impostos encomenda;
- calculo final inicial;
- PDF cliente;
- relatorio interno detalhado.

Ficam fora da V1:

- gerar processo de importacao;
- follow-up operacional;
- pricing Excel;
- pedido de compra completo;
- aplicacao direta das migrations de `temp/`.

### Integracao NCM

- Usar tabela local `ncm_codes`.
- Integracao externa Receita/Classif fica posterior ou rotineira.
- Na V1, preparar estrutura para snapshot e validacao RPX.

### Calculo fiscal

- O futuro `calculation-engine.ts` deve centralizar o calculo.
- Formulas complexas ainda abertas permanecem neste documento.
- Migrations podem preparar campos, mas o calculo final deve ser validado com simulacoes reais antes de uso operacional definitivo.

### PDF cliente e relatorio interno

- Diferenciar PDF cliente de relatorio interno.
- Ambos devem ser gerados a partir de snapshot.
- Evitar expor campos internos ao cliente.

## Criticas remanescentes antes/durante migrations

- Quais transicoes de status sao permitidas na V1?
- Quem pode aprovar uma simulacao final?
- O aprovador pode ser a mesma pessoa que criou ou editou a simulacao?
- Quais alteracoes devem gerar obrigatoriamente uma nova versao?
- Apos aprovacao, ajustes devem criar nova versao, duplicar a simulacao ou reabrir a mesma simulacao?
- O cliente acessara documento por signed URL, route handler seguro ou outro mecanismo?
- A primeira migration deve criar todas as tabelas aprovadas de uma vez ou fatiar em nucleos menores?
- `final_simulation_documents` entra na primeira migration ou apenas quando a geracao de documentos for implementada?
- Quais campos minimos de snapshot publico e interno entram ja na primeira migration?

## Documentacao e governanca

- Quais documentos de `temp/docs/` devem ser promovidos para `docs/` como especificacoes ativas?
- `docs/FINAL_SIMULATIONS_SPEC.md` deve nascer como adaptacao direta do material de `temp/` ou como uma spec nova resumida a partir do plano de migracao?
- `docs/NARWAL_MAPPING.md` deve continuar citando a Narwal em detalhe ou virar apenas anexo/referencia operacional?
- `docs/CALCULATION_RULES.md`, `docs/EXPENSES_ENGINE.md` e `docs/FISCAL_PARAMETRIZATION.md` devem ser documentos normativos ou documentos de hipoteses pendentes de validacao RPX?
- O relatorio `temp/docs/RODRIGO_IMPLEMENTATION_AUDIT.md` deve ser copiado/adaptado para o projeto atual ou este plano de migracao substitui essa auditoria?
- Quem aprova oficialmente a promocao de regras fiscais, despesas e PDF de `temp/docs/` para a documentacao ativa?

## Banco, auth e RLS

- Quais campos de auditoria operacional exigem FK para `app_users.id` ja na primeira migration?
- A funcao `current_client_id()` deve ser criada como helper SQL novo ou as policies devem consultar `app_users` diretamente?
- Quais tabelas de apoio podem ser lidas por clientes autenticados?
- Clientes podem ler NCMs/estados ativos diretamente ou apenas via dados publicados da simulacao?
- `invoice_parametrizations`, `expense_types` e `expense_presets` devem ser sempre admin-only?
- `ncm_codes` e `ncm_tax_profiles` devem ter RLS separada por status de validacao?
- Parametrizacoes fiscais podem ser especificas por cliente, filial ou globais?
- Estados/UFs precisam de seed inicial completo do Brasil?
- Em quais campos, se houver, enum Postgres traz beneficio suficiente para contrariar a preferencia inicial por `text` com check constraints?
- Qual desenho exato do CHECK de `uploads` deve ser usado ao adicionar `final_simulation_id` sem quebrar `quote_id` e `simulation_id` existentes?

## Produto e escopo

- A tabela atual `simulations` continuara representando solicitacoes e publicacoes simples?
- Como uma cotacao preliminar em `quotes` vira uma Simulacao Final?
- O campo de vinculo deve ser `source_quote_id`, `quote_id` ou outro nome?
- Uma Simulacao Final pode existir sem cotacao preliminar?
- Uma cotacao pode ter mais de uma Simulacao Final?
- Qual formato final de codigo/numero sequencial deve ser usado?
- A numeracao e global, por ano, por filial ou por cliente?
- Quais cadastros fonte existem ou precisam existir para filial, origem, destino, destino final, pais, embalagem e incoterm?
- Fornecedor sera cadastro mestre, snapshot textual ou ambos?
- Pedido de compra ja existe no processo RPX ou fica fora da V1?
- Importar Produtos sera por planilha, pedido, cotacao ou cadastro manual?

## Calculos e impostos

- Qual e a formula oficial de II?
- Qual e a formula oficial de IPI?
- Qual e a formula oficial de PIS?
- Qual e a formula oficial de COFINS?
- Qual e a formula oficial de ICMS?
- Como antidumping deve ser calculado?
- Antidumping depende de NCM, produto, origem, fornecedor ou regra manual?
- Frete collect + prepaid sempre compoe frete internacional?
- Frete nacional compoe algum imposto ou apenas custo final?
- Seguro `0,25` significa `0,25%`?
- Valor de seguro pode ser manual, calculado ou ambos?
- Como taxa moeda, taxa fechamento e paridade dolar se relacionam?
- Existem ajustes adicionais no valor aduaneiro alem de FOB, frete e seguro?
- Qual regra de arredondamento deve ser usada por item, imposto, despesa e total?
- Como evitar diferenca de centavos entre rateio por item e consolidado?
- Creditos IPI/PIS/COFINS/ICMS reduzem o custo final ou sao apenas demonstrativos?
- Comissao trade incide sobre qual base?
- Comissao entra como percentual, despesa manual, nao cobrada ou combinacao?
- O motor v1 pode calcular apenas parte do fiscal e bloquear aprovacao ate validacao manual?

## Despesas

- Quais opcoes finais existem para `expense_calculation_basis` alem de parametros, FOB, frete, seguro, CIF, II, IPI e ICMS?
- O que significa operacionalmente Base imposto?
- O que significa operacionalmente Base ICMS?
- O que significa operacionalmente Base IPI?
- O que significa Despesa acessoria?
- O que significa Somente custo produto?
- A modalidade Base de calculo gera linha sem custo final ou alimenta outras bases?
- Uma simulacao pode usar mais de um pre-calculo de despesas?
- Presets podem variar por filial, cliente, via transporte ou modalidade de importacao?
- Qual politica de reprocessamento de pre-calculo deve ser adotada: bloquear, substituir ou complementar?
- Despesas manuais podem usar qualquer tipo de despesa ativo?
- Despesas podem ser vinculadas a containers especificos?
- Quais formulas e valores padrao do preset PORTO devem virar seed oficial?
- Como validar despesas geradas por preset antes de entrar no calculo final?

## Produtos, NCM e fiscal

- Qual fonte oficial sera usada para aliquotas por NCM?
- Classif/Receita sera sincronizado em lote ou consultado em tempo real?
- Quais campos da base NCM precisam ficar em banco na V1?
- Quais aliquotas podem ser sugeridas automaticamente?
- Quais aliquotas sempre exigem revisao manual da equipe RPX?
- Quando a classificacao/aliquota pode ser considerada validada?
- Quais opcoes de Regime Especial devem existir?
- Como excecao fiscal impacta calculo e PDF?
- Como reducao de base impacta calculo e PDF?
- Consumo interno altera impostos, parametrizacao fiscal ou apenas classificacao operacional?
- `tax_type` deve permanecer enum tecnico minusculo (`ii`, `ipi`, `pis`, `cofins`, `icms`, `antidumping`)?
- NCM deve aparecer no PDF final do cliente?
- Cliente pode ver aliquotas por produto?

## Encomenda

- Impostos Encomenda alteram o custo final ou apenas parametrizacao fiscal?
- Quais campos de encomenda sao obrigatorios por produto?
- Estado de revenda deve vir da tabela `states`?
- Quais UFs devem iniciar ativas?
- A modalidade Encomenda exige parametrizacao fiscal especifica de saida?
- Percentual de lucro entra no calculo de custo, preco de venda ou memoria interna?
- Valor de outras despesas em encomenda compoe qual base?
- Excecao fiscal de encomenda e texto livre ou cadastro controlado?

## PDF, relatorio interno e exposicao ao cliente

- Quais campos aparecem no PDF cliente?
- O PDF cliente pode exibir FOB?
- O PDF cliente pode exibir NCM?
- O PDF cliente pode exibir aliquotas?
- O PDF cliente pode exibir detalhamento de impostos e despesas por produto?
- Cliente deve ver breakdown de impostos/despesas ou apenas total consolidado?
- Qual texto legal/comercial obrigatorio deve aparecer no PDF final?
- Qual validade padrao da simulacao final enviada ao cliente?
- Observacoes internas e motivos de revisao devem ficar fora de qualquer exportacao ao cliente?
- O PDF Cliente deve seguir o detalhamento do exemplo MOBITA ou ser mais resumido?
- O Relatorio Interno Detalhado deve ser PDF, XLSX ou ambos em fase futura?
- Arquivos de referencia MOBITA devem ser armazenados no repositorio ou mantidos fora como referencia externa?
- O cliente podera baixar PDF somente quando `status = sent_to_customer`?

## UI e operacao admin

- Simulacoes Finais deve aparecer no menu admin principal desde a Fase 3?
- Cadastros de apoio devem ficar em `/admin/cadastros/*`, `/admin/parametros/*` ou rotas diretas?
- A listagem precisa filtrar por NCM pesquisando itens da simulacao?
- O nome principal clicavel na lista deve ser codigo, numero ou cliente?
- Qual conjunto minimo de colunas entra na V1?
- A edicao deve ser em abas, etapas ou paginas separadas?
- A tela de Valores da Operacao entra antes ou depois de Produtos?
- O botao Recalcular deve ficar em todas as abas ou apenas no consolidado?
- Quando uma simulacao esta bloqueada, os formularios devem sumir ou ficar read-only?

## Seeds e dados iniciais

- Deve existir seed oficial de estados?
- Deve existir seed inicial de tipos de despesa?
- Deve existir seed inicial de pre-calculos?
- Deve existir seed inicial de parametrizacoes fiscais?
- A base NCM atual em JSON deve popular `ncm_codes` no banco?
- Quem valida os valores iniciais dos seeds?
- Seeds devem ser migration SQL, script separado ou processo manual controlado?

## Testes e validacao

- Quais cenarios numericos devem ser usados como referencia de aceite do motor?
- Existe memoria RPX aprovada para comparar os totais?
- O exemplo MOBITA pode ser usado como fixture de teste?
- Quais campos internos devem ser verificados explicitamente como ausentes no PDF cliente?
- Quais cenarios RLS devem ser validados antes de producao?
- O build deve ser obrigatorio em toda fase de alto risco?
