# Simulacoes Finais - Mapeamento de Output

Data: 2026-07-10

## Objetivo

Este documento mapeia o modelo real de output usado como referencia para Simulacoes Finais contra o modulo atual da plataforma Global RPX.

Arquivos analisados:

- `/Users/hugoferreira/Downloads/MOBITA CAPACETE.pdf`
- `/Users/hugoferreira/Downloads/MOBITA CAPACETE.xlsx`

Escopo deste documento:

- PDF cliente;
- planilha/relatorio interno detalhado;
- origem atual dos dados no sistema;
- lacunas para fechar a V1;
- prioridade de implementacao antes da geracao do PDF.

Fora do escopo:

- implementar PDF;
- alterar calculo;
- criar migrations;
- alterar `src/`.

## Taxonomia de Status

As tabelas abaixo usam estes status:

- `existente`: campo ja existe no modelo atual e pode ser usado diretamente ou via snapshot.
- `derivável`: valor calculado ou formatado a partir de campos existentes, sem nova coluna obrigatoria.
- `campo livre V1`: pode ser atendido na V1 por campo textual/snapshot existente, antes de decidir modelagem dedicada.
- `pendente Rodrigo`: depende de validacao de regra, formula, exposicao ao cliente ou modelagem com Rodrigo/RPX antes de implementar.

## Visao Geral dos Arquivos

O PDF `MOBITA CAPACETE.pdf` e uma pagina A4 paisagem gerada a partir da planilha `MOBITA CAPACETE.xlsx`. A planilha tem uma unica aba (`Sheet`) com tres blocos principais:

- linhas 1 a 58: layout do PDF cliente `Simulacao de importacao`;
- linhas 62 a 96: relatorio interno de despesas aduaneiras;
- linhas 98 a 132: bloco interno da modalidade `Encomenda`.

Observacao tecnica: a planilha recebida contem valores materializados, sem formulas preservadas no arquivo. Portanto, este mapeamento trata os valores como referencia de output, nao como fonte auditavel das formulas originais.

## Blocos do PDF Cliente

### Cabecalho

| Campo no modelo real | Exemplo do arquivo | Origem atual no sistema | Status | Acao necessaria |
|---|---:|---|---|---|
| Logo RPX | logo RPX no canto superior esquerdo | asset estatico `public/logo-global-rpx-horizontal.png` ou novo asset especifico | existente | Definir qual logo oficial usar no PDF final. |
| Titulo | `Simulação de importação` | template do PDF | derivável | Criar template do PDF cliente. |
| Numero | `201` | `final_simulations.number` | pendente Rodrigo | Definir geracao sequencial confiavel e regra por revisao/ano, se aplicavel. |
| Data do documento | `03/07/2026` | `final_simulations.quote_date` ou `created_at` | existente | Definir se a data exibida deve ser data da cotacao, criacao ou emissao do PDF. |
| Pagina | `1/1` | gerador de PDF | derivável | Implementar paginacao no motor de PDF. |
| Revisao | `201/3` | sem campo especifico; `simulation_versions.version_number` existe | pendente Rodrigo | Definir regra de revisao e origem: versao, numero da simulacao ou snapshot. |

### Dados da Simulacao

| Campo no modelo real | Exemplo do arquivo | Origem atual no sistema | Status | Acao necessaria |
|---|---:|---|---|---|
| Cliente | `DSG DISTRIBUIDORA DE ALIMENTOS LTDA` | `final_simulations.customer_name` ou `clients.company_name` | existente | Usar snapshot textual no PDF para preservar historico. |
| Moeda | `USD` | `final_simulations.currency` | existente | Usar no cabecalho e nos totais USD. |
| Paridade | `0,0000` | `final_simulations.dollar_parity` | pendente Rodrigo | Confirmar regra de negocio e se deve aparecer quando zerada. |
| Taxa | `5,1945` | `final_simulations.exchange_rate` | existente | Usar formatacao brasileira no PDF. |
| Taxa frete | `5,1945` | `final_simulations.freight_rate` | pendente Rodrigo | Confirmar se sempre igual ao cambio ou campo separado. |
| Data | `03/07/2026` | `final_simulations.quote_date` | existente | Validar label final. |
| Data validade | `10/07/2026` | `final_simulations.valid_until` | existente | Usar como validade comercial do PDF. |

### Dados Logisticos

| Campo no modelo real | Exemplo do arquivo | Origem atual no sistema | Status | Acao necessaria |
|---|---:|---|---|---|
| Origem | `GUANGDONG TERMINAL` | `final_simulations.origin` | existente | Usar snapshot textual. |
| Destino | `NAVEGANTES` | `final_simulations.destination` | existente | Usar snapshot textual. |
| Destino final | nao aparece no PDF de referencia | `final_simulations.final_destination` | pendente Rodrigo | Definir se entra no PDF cliente V1. |
| Incoterm | `FOB` | `final_simulations.incoterm` | existente | Exibir no cabecalho logistico. |
| Modal | `Marítimo` | `final_simulations.transport_mode` | existente | Mapear enum para label amigavel. |
| Container | `1-40,` | `container_20_qty`, `container_40_qty`, `container_lcl_qty`, `container_other_qty`, `container_load_type` | derivável | Padronizar renderizacao textual do container. |
| Container 20 | `0` no bloco interno | `final_simulations.container_20_qty` | existente | Usar no relatorio interno ou PDF se necessario. |
| Container 40 | `1` no bloco interno | `final_simulations.container_40_qty` | existente | Usar no relatorio interno ou PDF se necessario. |
| Container LCL | `0` no bloco interno | `final_simulations.container_lcl_qty` | existente | Usar no relatorio interno ou PDF se necessario. |
| LI | `Nao` | `final_simulations.requires_import_license` | existente | Renderizar como `Sim`/`Nao`; validar se precisa de detalhe da LI. |
| Carga IMO | `Nao` | `notes`, `internal_snapshot` ou futuro campo dedicado | campo livre V1 | Usar snapshot/campo livre na V1 e decidir depois se vira coluna. |
| Embalagem | vazio no exemplo | `final_simulations.packaging` | existente | Exibir somente quando preenchido. |
| Valor Frete USD | `5.000,00` | `final_simulations.international_freight_usd` | pendente Rodrigo | Integrar no calculo de CIF/base aduaneira. |
| Valor Seguro USD | `204,65` | `final_simulations.international_insurance_usd` | pendente Rodrigo | Integrar no calculo de CIF/base aduaneira. |
| Frete nacional | `0,00` | `final_simulations.national_freight_brl`, `has_national_freight` | existente | Exibir no bloco de frete e disclaimer. |

### Tabela de Produtos

| Campo no modelo real | Exemplo do arquivo | Origem atual no sistema | Status | Acao necessaria |
|---|---:|---|---|---|
| NCM | `65061000` | `final_simulation_items.ncm` | existente | Usar NCM snapshotado no item. |
| Produto | `Capacete` | `final_simulation_items.product_description` ou `product_name` | existente | Definir prioridade entre nome e descricao. |
| Quantidade | `7.000,00` | `final_simulation_items.quantity` | existente | Formatacao brasileira. |
| Valor unitario | `10,98000` | `final_simulation_items.unit_price` | existente | Definir casas decimais no PDF. |
| CIF | `427.784,82` | `final_simulation_items.cif_total` ou calculo/snapshot | pendente Rodrigo | O campo existe, mas o motor V1 ainda usa base simplificada; precisa consolidar formula oficial. |
| Taxa II | `18,00` | `final_simulation_items.ii_rate` | existente | Exibir percentual por item. |
| II | `77.001,27` | `simulation_tax_lines` com `tax_type = II` | existente | Usar linha salva apos recalc fiscal. |
| Taxa IPI | `0,00` | `final_simulation_items.ipi_rate` | existente | Exibir percentual por item. |
| IPI | `0,00` | `simulation_tax_lines` com `tax_type = IPI` | existente | Usar linha salva apos recalc fiscal. |
| Taxa PIS | `2,10` | `final_simulation_items.pis_rate` | existente | Exibir percentual por item. |
| PIS | `12.773,23` | `simulation_tax_lines` com `tax_type = PIS_IMPORTACAO` | existente | Usar linha salva apos recalc fiscal. |
| Taxa COFINS | `9,65` | `final_simulation_items.cofins_rate` | existente | Exibir percentual por item. |
| COFINS | `58.696,06` | `simulation_tax_lines` com `tax_type = COFINS_IMPORTACAO` | existente | Usar linha salva apos recalc fiscal. |
| Despesas | `60.646,03` | `final_simulation_items.allocated_expenses_total` ou rateio de `simulation_expense_lines` | pendente Rodrigo | Implementar rateio persistido por item antes do PDF. |
| ICMS | `24.454,23` | `simulation_tax_lines` com `tax_type = ICMS` | pendente Rodrigo | Confirmar formula oficial; V1 ainda simplifica ICMS. |
| IPI NF | `0,00` | `calculation_snapshot`, `public_snapshot` ou futuro campo dedicado | pendente Rodrigo | Definir se e linha fiscal, campo de NF saida ou derivável. |
| Antidumping | `0,00` | `final_simulation_items.antidumping_amount`, `simulation_tax_lines.ANTIDUMPING` | pendente Rodrigo | Campo existe, mas UI/calculo ainda nao operacionaliza. |
| Custo unitario estoque sem impostos BRL | `81,99873` | `final_simulation_items.unit_cost_without_taxes_brl` | pendente Rodrigo | Precisa persistir no recalc oficial antes do PDF. |
| Custo unitario estoque com impostos BRL | `92,20863` | `final_simulation_items.unit_cost_with_taxes_brl` | pendente Rodrigo | Precisa persistir no recalc oficial antes do PDF. |
| Custo unitario estoque sem impostos USD | `15,78568` | `final_simulation_items.unit_cost_without_taxes_usd` | pendente Rodrigo | Precisa persistir no recalc oficial antes do PDF. |
| Custo unitario estoque com impostos USD | `17,75120` | `final_simulation_items.unit_cost_with_taxes_usd` | pendente Rodrigo | Precisa persistir no recalc oficial antes do PDF. |

### Nota Fiscal de Entrada

| Campo no modelo real | Exemplo do arquivo | Origem atual no sistema | Status | Acao necessaria |
|---|---:|---|---|---|
| Valor total dos produtos | `586.901,41` | `calculation_snapshot`, `entry_invoice_parametrization_snapshot` e/ou totais deriváveis | pendente Rodrigo | Definir formula oficial da NF entrada. |
| Valor total das notas fiscais | `611.355,64` | `calculation_snapshot` ou futuro snapshot publico | pendente Rodrigo | Persistir valor calculado de NF entrada em snapshot estruturado. |
| Parametrizacao NF entrada | bloco visual sem CFOP no PDF | `entry_invoice_parametrization_id` e snapshot | existente | Decidir se CFOP/natureza aparecem no PDF cliente ou ficam internos. |

### Nota Fiscal de Saida

| Campo no modelo real | Exemplo do arquivo | Origem atual no sistema | Status | Acao necessaria |
|---|---:|---|---|---|
| Valor total dos produtos | `645.460,39` | `calculation_snapshot` ou snapshot de NF saida | pendente Rodrigo | Definir formula oficial para NF saida/encomenda. |
| Valor ICMS substituicao | `0,00` | `calculation_snapshot`, `public_snapshot` ou futuro campo dedicado | pendente Rodrigo | Definir se ICMS ST entra em `simulation_tax_lines` ou em novo campo/snapshot. |
| Valor IPI | `0,00` | `simulation_tax_lines.IPI` ou snapshot NF saida | pendente Rodrigo | Distinguir IPI importacao x IPI NF. |
| Valor total da nota fiscal | `681.828,18` | `final_simulations.total_cost_brl` ou snapshot | pendente Rodrigo | Confirmar se o total de custo estimado equivale ao total da NF saida. |

### Composicao da Base de ICMS

| Campo no modelo real | Exemplo do arquivo | Origem atual no sistema | Status | Acao necessaria |
|---|---:|---|---|---|
| CIF | `427.784,82` | `final_simulations.customs_value_brl` e/ou itens | existente | Confirmar formula oficial de CIF com frete/seguro. |
| II | `77.001,27` | `simulation_tax_lines.II` | existente | Usar linha salva. |
| IPI | `0,00` | `simulation_tax_lines.IPI` | existente | Usar linha salva. |
| PIS | `12.773,23` | `simulation_tax_lines.PIS_IMPORTACAO` | existente | Usar linha salva. |
| COFINS | `58.696,06` | `simulation_tax_lines.COFINS_IMPORTACAO` | existente | Usar linha salva. |
| Despesas aduaneiras | `10.646,03` | `final_simulations.total_expenses_brl` ou subset de `simulation_expense_lines` | pendente Rodrigo | Separar despesas que compoem base ICMS das despesas internas. |
| Antidumping | `0,00` | item/tax line preparado | pendente Rodrigo | Implementar regra. |
| Subtotal | `586.901,41` | derivável | derivável | Persistir em snapshot para PDF. |
| Base calculo ICMS | `611.355,64` | `calculation_snapshot` ou `simulation_tax_lines.ICMS.base_amount_brl` | pendente Rodrigo | V1 salva base por linha, mas precisa alinhar com formula oficial do PDF. |
| Credito presumido | `--` | `tax_regime_snapshot`, `public_snapshot` ou futuro campo dedicado | pendente Rodrigo | Definir regra de credito presumido separada dos creditos tributarios. |
| Honorarios | `0,00` | `simulation_expense_lines` ou `trade_commission_*` | pendente Rodrigo | Decidir se honorarios sao despesa, comissao trade ou campo dedicado. |

### Observacoes e Disclaimers

| Campo no modelo real | Exemplo do arquivo | Origem atual no sistema | Status | Acao necessaria |
|---|---:|---|---|---|
| Desembolso total | `681.828,18` | `final_simulations.total_cost_brl` | existente | Confirmar composicao final antes do PDF. |
| Desembolso total USD | `132.259,64` | derivável de total BRL/cambio ou snapshot | derivável | Persistir no snapshot do PDF. |
| Custo unitario total | `681.828,18` no exemplo | possivelmente `total_cost_brl` ou erro de label no modelo | pendente Rodrigo | Validar label/regra com RPX antes de automatizar. |
| Disclaimer frete nacional | `ESTA SIMULAÇÃO NÃO CONTEMPLA O FRETE RODOVIÁRIO NACIONAL.` | template + `has_national_freight` | derivável | Tornar disclaimer condicional. |
| Disclaimer legislacao/cambio | texto padrao sobre alteracao por legislacao/cambio | template do PDF | derivável | Criar cadastro/configuracao de disclaimers padrao. |
| Observacoes comerciais | bloco observacoes | `final_simulations.notes` e futuro campo publico | campo livre V1 | Separar observacao interna de observacao do cliente. |

## Planilha e Relatorio Interno

### Bloco de Despesas Aduaneiras

| Campo no modelo real | Exemplo do arquivo | Origem atual no sistema | Status | Acao necessaria |
|---|---:|---|---|---|
| Data | `03/07/2026` | `final_simulations.quote_date` | existente | Usar no relatorio interno. |
| Pagina | `1/1` | gerador de relatorio | derivável | Implementar quando gerar PDF/Excel interno. |
| Grupo de despesa | `Base de Calculo`, `Desembaraco Aduaneiro`, `Despesas Portuarias` | `expense_types.expense_group_name` ou `simulation_expense_lines.expense_category` | pendente Rodrigo | Padronizar grupos mestres. |
| Despesa | `THC/CAPATAZIA`, `TAXA SISCOMEX`, `A.F.R.M.M.` | `simulation_expense_lines.expense_name` | existente | Usar linhas de despesas salvas. |
| Valor R$ | `1.500,00`, `154,23`, `2.077,80` | `simulation_expense_lines.amount_brl` | existente | Confirmar se todas entram no PDF cliente ou so no interno. |
| Total por grupo | `5.300,00`, `52.077,80` | derivável por grupo | derivável | Calcular no relatorio interno. |
| Total despesas R$ | `62.146,03` | soma de `simulation_expense_lines.amount_brl` | existente | Hoje `total_expenses_brl` soma linhas; precisa reconciliar com subtotal usado no PDF cliente. |

Campos internos que nao devem aparecer no PDF cliente por padrao:

- granularidade completa de despesas por fornecedor/processo;
- `expense_type_snapshot`;
- origem de preset;
- flags `is_from_preset`, `is_manual`, `is_editable`;
- valores de assessoria operacional interna quando tratados como margem/custo interno;
- qualquer campo de auditoria (`created_by`, `updated_by`, snapshots tecnicos).

### Bloco Encomenda

| Campo no modelo real | Exemplo do arquivo | Origem atual no sistema | Status | Acao necessaria |
|---|---:|---|---|---|
| Modalidade | `Encomenda` | `final_simulations.import_modality = encomenda` | existente | Usar label amigavel. |
| Produto/quantidade | `Capacete`, `7.000` | `final_simulation_items` | existente | Reaproveitar itens. |
| Valor unitario BRL | `92,06543` | custo derivável | pendente Rodrigo | Definir formula e persistencia por item. |
| Valor produto | `594.158,07` | custo derivável | pendente Rodrigo | Persistir em snapshot interno. |
| IPI/PIS/COFINS/ICMS | `0`, `10.917,41`, `50.286,25`, `26.466,45` | `simulation_tax_lines` ou snapshot especifico encomenda | pendente Rodrigo | Separar impostos de importacao dos impostos da venda/encomenda. |
| ICMS ST | `0` | `internal_snapshot`, `public_snapshot` ou futuro campo dedicado | pendente Rodrigo | Definir modelo para ICMS ST. |
| Imposto sobre faturamento | `0` | `internal_snapshot` ou futuro campo dedicado | pendente Rodrigo | Definir se entra como despesa, imposto ou snapshot. |
| Valor entrada | `573.991,10` | derivável | pendente Rodrigo | Persistir em snapshot interno. |
| Valor encomenda | `661.661,21` | derivável | pendente Rodrigo | Persistir em snapshot interno. |

Campos internos que nao devem aparecer no PDF cliente por padrao:

- decomposicao de encomenda por imposto de faturamento;
- calculos intermediarios de valor entrada/encomenda, salvo se o cliente pedir demonstrativo;
- parametros internos de margem, honorarios ou comissao;
- snapshots tecnicos e rateios por comportamento fiscal.

## Comparacao com o Modulo Atual

| Entidade atual | O que cobre hoje | Lacunas para output real |
|---|---|---|
| `final_simulations` | dados principais, cambio, frete/seguro USD, despesas/impostos/custo totais, pesos, containers, snapshots, comissao trade e parametrizacoes fiscais | sequencial/revisao oficial, carga IMO, observacoes publicas separadas, snapshots finais de NF entrada/saida, totais USD finais, regras oficiais de custo unitario. |
| `final_simulation_items` | produtos, NCM, aliquotas, totais basicos, custos unitarios preparados, antidumping preparado | persistencia completa dos custos unitarios calculados, CIF oficial por item, despesas rateadas por item, IPI NF, ICMS ST e campos de venda/encomenda. |
| `simulation_expense_lines` | despesas manuais e de preset, valores BRL/USD, grupo/categoria, comportamento snapshotado | classificacao clara de quais despesas entram no PDF cliente, quais entram na base ICMS e quais sao apenas internas. |
| `simulation_tax_lines` | linhas salvas de II, IPI, PIS, COFINS, ICMS, AFRMM, antidumping e outros | nao modela creditos negativos, ICMS ST, IPI NF separado, imposto sobre faturamento ou natureza entrada/saida. |
| `invoice_parametrizations` | cadastro e snapshots de NF entrada/saida | precisa alimentar snapshots finais exibiveis no PDF e formulas oficiais. |
| `calculation_snapshot` | snapshot V1 do calculo fiscal salvo, warnings, totais e data do calculo | precisa evoluir para snapshot publico e interno com estrutura fechada para PDF/relatorio. |
| `simulation_documents` | metadados de PDF cliente, relatorio interno e Excel de pricing | ainda nao ha geracao real nem vinculo de upload final validado. |
| `uploads` | bucket privado e arquivos anexos gerais | precisa avaliar `uploads.final_simulation_id` antes de anexar documentos gerados diretamente a Simulacoes Finais. |

## Lacunas Provaveis e Prioridade

| Lacuna | Prioridade | Motivo |
|---|---:|---|
| Snapshot final publico do PDF cliente | Alta | Evita que PDF antigo mude quando dados/cadastros forem alterados. |
| Sequencial e revisao oficial da simulacao | Alta | PDF real exibe `Numero` e `Revisao`; precisa regra auditavel. |
| Formula oficial de CIF/base aduaneira/base ICMS | Alta | O PDF depende desses valores e o motor V1 ainda e simplificado. |
| Rateio de despesas por item | Alta | Tabela de produtos mostra `Despesas` e custos unitarios por item. |
| Separacao despesas cliente x despesas internas | Alta | PDF cliente nao deve expor tudo que esta na planilha interna. |
| Snapshot de NF entrada/saida com totais | Alta | Blocos de NF sao centrais no PDF. |
| Custos unitarios estoque sem/com impostos BRL/USD | Alta | Colunas centrais do modelo real. |
| Frete internacional USD e seguro USD no calculo oficial | Alta | Campos ja existem, mas precisam entrar na formula fechada. |
| Frete nacional BRL/disclaimer condicional | Media | Campo existe; falta regra de exposicao. |
| Carga IMO | Media | Aparece no cabecalho logistico e nao existe campo dedicado. |
| LI detalhada | Media | Hoje ha booleano; pode ser suficiente na V1, mas faltam detalhes. |
| Embalagem | Media | Campo existe, mas precisa regra de preenchimento e exibicao. |
| Honorarios | Media | Precisa decidir se e despesa, comissao trade ou campo separado. |
| Credito presumido | Media | Diferente das flags atuais de credito tributario. |
| Antidumping operacional | Media | Campos existem, mas calculo/UI ainda incompletos. |
| ICMS ST | Media | Aparece no bloco encomenda e nao esta modelado claramente. |
| Imposto sobre faturamento | Media | Aparece na planilha interna e nao esta modelado claramente. |
| Desembolso total USD | Media | Derivado, mas deve ser snapshotado para historico. |
| Observacoes comerciais publicas | Media | Hoje `notes` mistura potencialmente usos interno/publico. |
| Disclaimers padrao configuraveis | Baixa | Pode nascer como template fixo na V1 e virar config depois. |
| Terminal | Baixa | Origem atual contem `GUANGDONG TERMINAL`; se precisar separar terminal, criar campo futuro. |
| Container textual consolidado | Baixa | Numeros de container existem; falta formatacao igual ao modelo. |

## Recomendacao de Ordem Antes do PDF

1. Fechar contrato de snapshot do PDF cliente (`public_snapshot`) e do relatorio interno (`internal_snapshot`), com estrutura versionada.
2. Ajustar o motor fiscal para incluir frete internacional, seguro, CIF oficial, base ICMS oficial, despesas elegiveis por base e totais de NF entrada/saida.
3. Implementar rateio de despesas por item e persistir custos unitarios sem/com impostos em BRL/USD.
4. Definir regra de numero sequencial e revisao (`number` + `simulation_versions.version_number` ou campo dedicado).
5. Separar observacoes/disclaimers publicos de notas internas.
6. Decidir modelagem para carga IMO, credito presumido, ICMS ST, IPI NF, honorarios e imposto sobre faturamento.
7. Somente depois disso, implementar geracao do PDF cliente e registrar em `simulation_documents`.

## Perguntas Abertas para Rodrigo

1. O numero exibido no PDF (`201`) deve ser sequencial global, por cliente, por ano ou importado do processo atual?
2. A revisao (`201/3`) deve vir de `simulation_versions.version_number`, de um campo dedicado ou de regra externa?
3. A data do cabecalho deve representar data da cotacao, data de emissao do PDF ou data de validade/processo?
4. `Paridade` e `Taxa frete` devem aparecer sempre, mesmo quando zeradas ou iguais ao cambio?
5. O PDF cliente deve mostrar `Destino final` quando preenchido ou manter apenas `Destino`?
6. `Carga IMO` pode nascer como campo livre/snapshot na V1 ou precisa de campo dedicado com validacao?
7. Quais despesas entram em `Despesas aduaneiras` do PDF cliente e quais ficam apenas no relatorio interno?
8. A base de ICMS deve seguir exatamente o modelo da planilha ou ha ajuste fiscal mais recente?
9. Como calcular e exibir `Credito presumido`?
10. `Honorarios` representam despesa operacional, comissao trade ou campo comercial separado?
11. ICMS ST, IPI NF e imposto sobre faturamento devem virar linhas fiscais, campos dedicados ou apenas snapshot?
12. O bloco `Encomenda` da planilha deve gerar output interno apenas ou tambem algum resumo para o cliente?
13. O `Desembolso total` do PDF deve ser igual a `total_cost_brl` ou a outro total fiscal/comercial?
14. O `Desembolso total (USD)` deve ser calculado sempre por cambio da simulacao ou por taxa/paridade especifica?
15. As observacoes/disclaimers devem ser fixas na V1 ou configuraveis por tipo de simulacao?

## Decisoes para V1

- O PDF cliente deve ser gerado a partir de snapshot, nao de leitura direta das tabelas mutaveis.
- A planilha/relatorio interno pode expor detalhamento de despesas, formulas, warnings e campos operacionais que nao aparecem ao cliente.
- Campos internos, parametros comerciais e snapshots tecnicos nao devem ser exibidos no PDF cliente.
- O PDF cliente deve priorizar clareza e rastreabilidade, mesmo que a primeira V1 nao replique todos os blocos internos da planilha.
