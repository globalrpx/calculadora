# Simulacoes Finais - Fechamento V1

Data: 2026-07-10

## Resumo da V1

O modulo Simulacoes Finais esta funcional e validado no Supabase Dev.

Fluxo completo validado:

- criar simulacao final;
- adicionar produto;
- adicionar despesa;
- configurar parametrizacao fiscal;
- recalcular impostos;
- gerar snapshots;
- abrir preview cliente;
- gerar PDF cliente;
- salvar PDF cliente no Storage;
- gerar relatorio interno;
- listar documentos gerados.

Ambiente validado:

- Supabase Dev: `neomzmuaocniunjyvpsk`;
- bucket privado: `app-uploads`;
- simulacao completa de referencia: `0358251e-4d4a-4709-b522-97ef94fe73be`;
- codigo da simulacao: `DEV-DOC-364682`.

## Rotas Principais

Rotas do modulo:

- `/admin/simulacoes-finais`;
- `/admin/simulacoes-finais/nova`;
- `/admin/simulacoes-finais/[id]`;
- `/admin/simulacoes-finais/[id]/editar`;
- `/admin/simulacoes-finais/[id]/preview-cliente`;
- `/admin/simulacoes-finais/[id]/pdf-cliente`;
- `/admin/simulacoes-finais/[id]/documentos/[documentId]/pdf`.

Cadastros de apoio:

- `/admin/cadastros/tipos-despesa`;
- `/admin/cadastros/pre-calculos-despesas`;
- `/admin/cadastros/parametrizacoes-fiscais`.

## Fluxo Operacional Recomendado

1. Criar a simulacao final em `/admin/simulacoes-finais/nova`.
2. Preencher dados principais.
3. Adicionar produtos.
4. Adicionar despesas manuais ou processar pre-calculo.
5. Configurar NF entrada, NF saida, creditos e comissao trade.
6. Recalcular impostos V1.
7. Gerar snapshots dos documentos.
8. Conferir o preview cliente.
9. Gerar PDF cliente.
10. Gerar relatorio interno.
11. Usar `Documentos gerados` para visualizar, baixar ou abrir versoes salvas.

Regra operacional importante:

- Recalculo fiscal nao acontece automaticamente ao abrir a pagina.
- PDF cliente e relatorio interno sao gerados a partir dos snapshots salvos.
- Quando dados relevantes mudarem, o operador deve recalcular impostos e gerar novos snapshots antes de emitir novos documentos.

## Documentos e Versionamento

Cada geracao cria um novo registro em `simulation_documents`.

Comportamento validado:

- documentos antigos nao sao sobrescritos;
- os arquivos usam paths unicos no bucket `app-uploads`;
- a lista ordena por `generated_at desc`;
- o documento mais recente recebe badge `Mais recente`;
- `Visualizar`, `Baixar PDF` e `Abrir em nova aba` usam o documento salvo;
- `uploads` nao e usado para `final_simulations` nesta V1.

Fontes dos documentos:

- PDF cliente usa `final_simulations.public_snapshot`;
- relatorio interno usa `final_simulations.internal_snapshot`;
- metadados e snapshot usado ficam em `simulation_documents.snapshot_json`;
- arquivos ficam no bucket privado `app-uploads`.

## Calculo Fiscal V1

O calculo fiscal V1 foi implementado como base operacional inicial e precisa ser validado com Rodrigo/equipe fiscal antes de uso produtivo amplo.

Limitacoes conhecidas:

- ICMS simplificado, sem gross-up oficial;
- despesas rateadas por FOB;
- creditos nao viram linhas fiscais negativas;
- `total_taxes_brl` representa impostos brutos;
- `total_cost_brl` inclui comissao trade;
- formulas ainda precisam validacao fiscal com simulacoes reais.

Linhas fiscais persistidas por item:

- `II`;
- `IPI`;
- `PIS_IMPORTACAO`;
- `COFINS_IMPORTACAO`;
- `ICMS`.

## PDF Cliente V1

O PDF cliente V1 e baseado exclusivamente em `public_snapshot`.

Caracteristicas:

- campos sem origem estruturada aparecem como `N/A`;
- nao exibe JSON cru;
- nao expõe `internal_snapshot`;
- nao expõe despesas internas detalhadas nem linhas fiscais internas fora do formato publico;
- layout aproxima o modelo real recebido, mas ainda nao replica 100%;
- depende de validacao do Rodrigo antes de virar modelo definitivo.

## Relatorio Interno V1

O relatorio interno V1 e baseado em `internal_snapshot`.

Conteudo:

- dados principais da simulacao;
- produtos;
- despesas;
- linhas fiscais;
- parametrizacao fiscal;
- warnings;
- limitacoes do calculo V1.

Limite atual:

- ainda nao substitui a planilha/Excel interno detalhado;
- nao possui formulas auditaveis de planilha;
- deve ser tratado como relatorio operacional inicial para conferencia.

## Pendencias Para Rodrigo Validar

Pendencias de numeracao e revisao:

- numero/revisao oficial da simulacao;
- regra de sequencial por cliente, ano, revisao ou emissao;
- status/versionamento de documento aprovado, enviado, obsoleto ou cancelado.

Pendencias fiscais e de custo:

- formula oficial de CIF;
- formula oficial da base ICMS;
- formula oficial da NF entrada;
- formula oficial da NF saida;
- formula de custo unitario estoque sem impostos;
- formula de custo unitario estoque com impostos;
- rateio oficial de despesas por item;
- se `total_taxes_brl` deve continuar bruto ou virar liquido;
- como creditos devem aparecer;
- antidumping;
- ICMS ST;
- IPI NF;
- credito presumido;
- honorarios;
- imposto sobre faturamento.

Pendencias logisticas e comerciais:

- frete internacional USD como campo proprio e regra de calculo;
- seguro USD como campo proprio e regra de calculo;
- frete nacional BRL;
- terminal;
- container;
- LI;
- IMO;
- embalagem;
- observacoes comerciais padrao;
- disclaimers finais.

Pendencias de exposicao:

- quais campos sao internos e nunca devem aparecer para cliente;
- quais campos fiscais podem aparecer no PDF cliente;
- necessidade futura de Excel/planilha interna;
- area cliente para visualizar PDFs publicados.

## Dados de Teste Dev

Ambiente:

- Supabase Dev: `neomzmuaocniunjyvpsk`;
- Admin Dev: `admin-dev@globalrpx.com`;
- Cliente Dev: `cliente1@globalrpx.com`.

Simulacao completa validada:

- ID: `0358251e-4d4a-4709-b522-97ef94fe73be`;
- codigo: `DEV-DOC-364682`;
- cliente: `Cliente Teste Documento Dev`.

Resultados da etapa 7:

- recalc fiscal manteve 5 linhas nao manuais;
- `customs_value_brl`: aproximadamente `670`;
- `total_taxes_brl`: aproximadamente `355.81`;
- `total_cost_brl`: aproximadamente `1038.81`;
- PDF cliente novo gerado: `f3b6ee25-b2ba-4356-8a08-7ea4a2fbc4cb`;
- relatorio interno novo gerado: `7da68aa2-3270-4e7b-83f1-15e0fde7d858`;
- contagem final validada: 2 PDFs cliente e 4 relatorios internos.

## Checklist Antes de Producao

Ambiente e deploy:

- revisar variaveis de ambiente na Vercel;
- garantir `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e secrets server-side do Supabase Prod;
- confirmar que `vercel.json` continua sem deploy automatico por push, conforme regra operacional atual;
- revisar Redirect URLs do Supabase Auth em producao.

Banco:

- rodar dry-run Prod;
- conferir migrations pendentes;
- definir janela e responsavel pela aplicacao;
- definir backup/rollback;
- aplicar migrations Prod somente com confirmacao explicita;
- validar estrutura criada no Prod apos aplicacao.

Seguranca:

- criar admin real Prod;
- trocar senhas fracas de teste;
- validar RLS/permissoes com admin e pelo menos dois clientes;
- confirmar que service role nao esta exposta no client;
- revisar policies de Storage privado.

Operacao:

- cadastrar parametrizacoes fiscais reais;
- cadastrar tipos de despesa reais;
- cadastrar pre-calculos reais;
- testar fluxo completo em Prod com uma simulacao controlada;
- revisar PDF cliente com Rodrigo;
- revisar relatorio interno com equipe RPX;
- limpar ou ignorar dados Dev.

## Fora do Escopo Desta V1

- Excel interno detalhado;
- formula fiscal avancada;
- gross-up oficial de ICMS;
- status/versionamento de aprovacao documental;
- envio automatico por e-mail;
- area cliente para acessar PDFs;
- assinatura digital;
- controle de documento obsoleto, enviado ou cancelado;
- integracao externa de classificacao NCM;
- processo de importacao completo;
- pedido de compra completo;
- pricing Excel.

## Resultado

A V1 de Simulacoes Finais esta fechada no Supabase Dev como fluxo administrativo funcional. O modulo esta pronto para revisao de negocio/fiscal com Rodrigo antes de qualquer promocao para producao.
