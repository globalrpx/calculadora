# Perguntas Abertas - Simulacoes Finais

Data: 2026-07-09

Este documento consolida duvidas encontradas na comparacao entre a arquitetura atual do projeto e a implementacao anterior em `temp/`.

Antes de criar migrations ou implementar codigo, as perguntas marcadas como criticas devem ser respondidas ou assumidas formalmente.

## Criticas para Fase 0

- Simulacoes Finais deve ser uma nova entidade `final_simulations` ou uma evolucao da tabela atual `simulations`?
- A rota administrativa final deve ser `/admin/simulacoes-finais` ou o modulo deve substituir/evoluir `/admin/simulacoes`?
- O status atual de `simulations` deve continuar separado dos status de Simulacoes Finais?
- Quais status entram na V1: `draft`, `in_review`, `needs_adjustment`, `approved`, `sent_to_customer`, `archived`?
- Quais transicoes de status sao permitidas na V1?
- Quem pode aprovar uma simulacao final?
- O aprovador pode ser a mesma pessoa que criou ou editou a simulacao?
- Quais alteracoes devem gerar obrigatoriamente uma nova versao?
- Apos aprovacao, ajustes devem criar nova versao, duplicar a simulacao ou reabrir a mesma simulacao?
- Documentos finais devem usar o padrao atual `uploads` + `app-uploads` ou uma nova tabela/bucket especifico?
- Se houver tabela especifica de documentos, como ela se relaciona com `uploads` sem duplicar responsabilidades?
- O cliente acessara documento por signed URL, route handler seguro ou outro mecanismo?

## Banco, auth e RLS

- Todas as FKs de usuario devem apontar para `app_users.id`, `auth.users.id` ou ambos conforme o tipo de auditoria?
- A funcao `current_client_id()` deve ser criada/atualizada usando `app_users`?
- Quais tabelas de apoio podem ser lidas por clientes autenticados?
- Clientes podem ler NCMs/estados ativos diretamente ou apenas via dados publicados da simulacao?
- `invoice_parametrizations`, `expense_types` e `expense_presets` devem ser sempre admin-only?
- `ncm_codes` e `ncm_tax_profiles` devem ter RLS separada por status de validacao?
- Parametrizacoes fiscais podem ser especificas por cliente, filial ou globais?
- Estados/UFs precisam de seed inicial completo do Brasil?
- O projeto deve criar enum Postgres ou preferir `text` com check constraints para facilitar evolucao?
- Como evitar conflito entre `simulation_documents` de `temp/` e a tabela atual `uploads`?

## Produto e escopo

- Simulacoes Finais entram como modulo separado da simulacao basica atual?
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
