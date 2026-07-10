# Especificacao da Calculadora - Global RPX

## Objetivo

A calculadora e o primeiro modulo funcional da plataforma Global RPX. Ela permite que um cliente autenticado estime rapidamente o custo de chegada de um produto no Brasil e visualize a economia estimada ao comprar via RPX em vez de tentar uma importacao direta.

Esta calculadora nao substitui analise fiscal, logistica ou operacional. Ela e uma ferramenta preliminar para triagem comercial e tomada rapida de decisao.

## Usuarios

### Cliente

Usa a calculadora para:

- Criar nova cotacao.
- Anexar imagens do produto.
- Consultar historico.
- Copiar resumo da cotacao.
- Visualizar economia estimada via RPX.

### Admin RPX

Usa as cotacoes para:

- Avaliar oportunidades.
- Criar simulacoes mais completas.
- Comparar dados informados pelo cliente com parametros internos.
- Publicar simulacoes para o cliente.

## Navegacao do Cliente

Menus iniciais da area do cliente:

```text
Calculadora
Simulacoes
```

### Calculadora

Subareas:

- Nova cotacao.
- Historico de cotacoes.
- Detalhe da cotacao.

### Simulacoes

Subareas:

- Lista de simulacoes publicadas pela RPX.
- Detalhe da simulacao.

## Fluxo Principal da Cotacao

1. Cliente acessa a area logada.
2. Cliente abre o menu `Calculadora`.
3. Cliente inicia uma nova cotacao.
4. Sistema carrega parametros ativos definidos no admin RPX.
5. Cliente informa os dados principais do produto.
6. Cliente pode informar dados do fornecedor, se tiver:
   - Nome, e-mail e telefone; e/ou
   - Foto do cartao de visitas ou contato do fornecedor.
7. Cliente pode anexar uma ou mais imagens do produto.
8. Cliente clica em `Fazer calculo`.
9. Sistema valida os dados obrigatorios e calcula:
   - FOB total.
   - Custo estimado via RPX.
   - Custo estimado por importacao direta.
   - Economia estimada.
10. Sistema exibe os totalizadores apenas depois da validacao.
11. Sistema salva a cotacao automaticamente no banco ao concluir o calculo.
12. Cotacao aparece no historico.
13. Cliente pode solicitar uma simulacao completa a partir do resultado.
14. Admin RPX consegue visualizar a cotacao e a solicitacao no painel administrativo.

## Campos da Nova Cotacao

### Produto

```text
Nome do produto
HS Code ou NCM sugerido
Imagens do produto
```

Regras:

- Nome do produto e obrigatorio.
- HS/NCM e obrigatorio para salvar, mas deve ser tratado como preliminar.
- Sistema pode sugerir HS/NCM por palavras-chave ou base futura.
- Cliente pode editar manualmente o HS/NCM.
- Deve haver aviso claro de que a classificacao fiscal nao e definitiva.
- Cliente pode anexar fotos do produto separadamente das fotos de contato do fornecedor.

### Fornecedor

```text
Nome do fornecedor
E-mail do fornecedor
Telefone do fornecedor
Foto do cartao ou contato do fornecedor
```

Regras:

- Todos os campos de fornecedor sao opcionais nesta fase.
- O cliente pode preencher dados parciais do fornecedor sem bloquear a cotacao.
- Se o e-mail do fornecedor for informado, deve ter formato valido.
- Foto do contato pode registrar cartao de visita, anotacao, pagina de caderno ou outra referencia recebida do fornecedor.
- Nesta fase, validar apenas formato e tamanho quando houver anexo.
- OCR de cartoes e extracao automatica de dados ficam para uma etapa futura.
- OCR futuro deve considerar conteudo em portugues, ingles, mandarim e outros idiomas.
- Dados e anexos do fornecedor devem permanecer associados a cotacao no historico.

### Valores

```text
FOB unitario em dolar
Quantidade
FOB total em dolar
Taxa de cambio interna
Fator RPX
Fator importacao direta
```

Regras:

- FOB unitario e obrigatorio.
- Quantidade e obrigatoria.
- FOB total e calculado automaticamente.
- A taxa deve vir da PTAX venda mais recente disponivel do Banco Central, consultada em tempo de execucao.
- A taxa interna usada no calculo deve ser `PTAX venda x 1.03`.
- O acrescimo de 3% representa um custo interno da RPX.
- O cliente nao deve visualizar nem editar a PTAX, a taxa ajustada ou o acrescimo interno.
- Se a consulta automatica falhar, o calculo deve ser bloqueado com uma mensagem generica para tentar novamente.
- A cotacao deve salvar internamente a taxa ajustada usada no momento do calculo para preservar o historico.
- Fator RPX vem da configuracao administrativa `config.key = 'import_factor'` e nao deve ser exibido nem editado pelo cliente.
- Fator importacao direta permanece parametro interno independente e nao deve ser exibido nem editado pelo cliente.
- Fator RPX deve ser editavel apenas no painel administrativo em `/admin/configuracoes`.
- Fator importacao direta permanece fora do escopo da configuracao dinamica atual.
- O valor padrao inicial do fator RPX e `1.8`.
- O valor padrao inicial do fator importacao direta e `2.2`.
- O cliente visualiza os resultados calculados, mas nao os fatores internos usados no calculo.
- Ao salvar uma cotacao, o servidor deve buscar `import_factor`, converter para numero, usar esse valor no calculo e salvar o mesmo valor em `quotes.rpx_factor`.
- O calculo salvo nao deve confiar em `rpxFactor` enviado pelo client.

### Padroes Iniciais

```text
Fator RPX padrao: 1.8
Fator importacao direta padrao: 2.2
Quantidade padrao: 1000
Maximo inicial de imagens: 5
Maximo inicial de fotos de contato do fornecedor: 3
```

O fator RPX padrao e administrado por `config.import_factor`. Os demais valores permanecem constantes internas ate nova rodada.

### Configuracao Administrativa dos Fatores

- Criar configuracao administrativa `import_factor`.
- Valor inicial: `1.8`.
- Apenas usuarios administrativos podem visualizar e editar configuracoes.
- A area do cliente nao deve exibir os campos, valores ou fatores em resumos copiados.
- Alteracoes futuras do `import_factor` devem afetar novas cotacoes.
- Cada cotacao deve salvar internamente o fator RPX usado no momento do calculo em `quotes.rpx_factor`.
- `direct_import_factor = 2.2` permanece independente e fora do escopo desta configuracao.

### Exibicao do Resultado

- Totalizadores nao devem aparecer durante o preenchimento inicial.
- O cliente deve clicar em `Fazer calculo`.
- Antes do calculo, validar produto, HS/NCM e valores obrigatorios.
- As etapas devem funcionar como uma sanfona sequencial:
  - Etapa 1 aberta e Etapa 2 fechada no inicio.
  - Ao calcular, Etapa 1 recolhe e Etapa 2 abre.
  - Apenas uma etapa deve permanecer aberta por vez.
- Depois da validacao, exibir:
  - Estimativa com a RPX.
  - Referencia de importacao direta.
  - Diferenca estimada com a RPX.
  - Valor FOB informado.
- Organizar os totalizadores em duas colunas no desktop e uma coluna no mobile.
- Usar numeros com tamanho moderado para evitar blocos apertados.
- Alterar dados depois do calculo deve invalidar o resultado anterior e exigir novo clique em `Fazer calculo`.
- O topo da Etapa 2 deve exibir `Solicitar simulacao completa` e `Refazer calculo`.
- `Refazer calculo` recolhe a Etapa 2 e reabre a Etapa 1 preservando os dados preenchidos.
- `Solicitar simulacao completa` cria uma solicitacao vinculada a cotacao, sem duplicar solicitacoes pendentes para a mesma cotacao.

## Regras de Calculo

### FOB Total

```text
FOB total USD = FOB unitario USD x quantidade
```

### Custo Via RPX

```text
Custo unitario via RPX BRL = FOB unitario USD x dolar usado x fator RPX
Custo total via RPX BRL = custo unitario via RPX BRL x quantidade
```

### Custo Importacao Direta

```text
Custo unitario importacao direta BRL = FOB unitario USD x dolar usado x fator importacao direta
Custo total importacao direta BRL = custo unitario importacao direta BRL x quantidade
```

### Economia Estimada

```text
Economia estimada BRL = custo total importacao direta BRL - custo total via RPX BRL
Economia estimada % = economia estimada BRL / custo total importacao direta BRL
```

Se a economia for menor ou igual a zero, o sistema deve exibir mensagem neutra, sem forcar beneficio comercial.

## Resultado Exibido

A tela deve exibir o resultado na mesma experiencia, com destaque para:

```text
Custo estimado total via RPX
Custo estimado unitario via RPX
Economia estimada comprando via RPX
Percentual de economia estimada
```

Detalhes exibidos:

```text
Produto
HS/NCM informado
FOB unitario
Quantidade
FOB total
Custo estimado unitario via RPX
Custo estimado total via RPX
Custo estimado total importacao direta
Economia estimada
```

PTAX, taxa ajustada, acrescimo interno e fatores devem permanecer apenas nos dados internos da cotacao.

Aviso obrigatorio:

```text
Estimativa preliminar sujeita à validação fiscal, logística e operacional.
```

## Imagens da Cotacao

### Requisitos

- Cliente pode anexar uma ou mais imagens.
- Cliente pode anexar, em campo separado, fotos do cartao ou contato do fornecedor.
- Limite inicial sugerido: 5 imagens por cotacao.
- Limite inicial sugerido: 3 fotos de contato do fornecedor por cotacao.
- Formatos aceitos: JPG, PNG, WEBP.
- Cada imagem deve ter limite de tamanho configuravel.
- Imagens devem ser enviadas para Supabase Storage.
- Banco salva apenas metadados e caminho do arquivo.

### Tabela de uploads

A arquitetura nova de anexos usa a tabela unica `uploads`, com FK real para `quotes` por `quote_id` e `context` indicando o papel do arquivo. Para cotacoes, usar:

```text
quote_id = id da cotacao
context = quote_product_images | quote_supplier_contact
path produto = quotes/{quote_id}/product-images/{upload_id}/{safe_filename}
path fornecedor = quotes/{quote_id}/supplier-contact/{upload_id}/{safe_filename}
```

Nao criar novos campos textuais de arquivo em `quotes`.

Regras atuais da calculadora:

- `Imagens do produto`: ate 5 arquivos, imagens ou PDF, contexto `quote_product_images`.
- `Foto do cartao ou contato do fornecedor`: ate 5 arquivos, imagens ou PDF, contexto `quote_supplier_contact`.
- Imagens sao comprimidas no navegador antes do upload.
- Cada arquivo final deve ter ate 6MB.
- PDF e permitido sem compressao.
- DOC, XLS, ZIP, SVG, JS e demais tipos fora da allowlist sao bloqueados nesta tela.
- Dados do fornecedor sao opcionais; quando enviados, devem ser preservados na cotacao e nos uploads de contexto `quote_supplier_contact`.
- Signed URLs sao geradas apenas sob demanda para visualizacao/download.
- `product_image_urls` e `supplier_contact_image_urls` ficam como campos legados e nao sao a fonte principal da nova implementacao.

### Tabela quote_images legada/planejada originalmente

```text
id
quote_id
client_id
uploaded_by_user_id
storage_path
file_name
content_type
file_size
image_type
created_at
```

Tipos iniciais:

```text
product
supplier_contact
```

### Bucket Supabase

```text
app-uploads
```

Estrutura sugerida:

```text
quotes/{quote_id}/product-images/{upload_id}/{safe_filename}
quotes/{quote_id}/supplier-contact/{upload_id}/{safe_filename}
```

## Historico de Cotacoes

O cliente deve visualizar apenas as proprias cotacoes.

Campos na listagem:

```text
Data
Produto
HS/NCM
FOB total
Custo total via RPX
Economia estimada
Status
```

Filtros iniciais:

- Busca por produto.
- Status.
- Periodo.

Acoes:

- Abrir detalhe.
- Duplicar cotacao.
- Copiar resumo.

## Detalhe da Cotacao

O detalhe deve mostrar:

- Dados informados.
- Imagens anexadas.
- Resultado calculado.
- Economia estimada.
- Status.
- Se houver simulacao relacionada, link para a simulacao publicada.

## Texto Copiado

Formato sugerido:

```text
Produto: [nome do produto]
HS/NCM: [codigo informado]
FOB unitario: US$ [valor]
Quantidade: [quantidade]
FOB total: US$ [valor]

Estimativa com a RPX: R$ [valor]
Referencia de importacao direta: R$ [valor]
Diferenca estimada com a RPX: R$ [valor] ([percentual]%)

Estimativa preliminar sujeita à validação fiscal, logística e operacional.
```

O texto copiado nao deve incluir PTAX, taxa ajustada, acrescimo interno ou fatores.

## Status da Cotacao

```text
draft
submitted
under_review
simulated
archived
```

Uso inicial:

- `submitted`: cotacao criada pelo cliente.
- `under_review`: RPX esta analisando.
- `simulated`: RPX criou uma simulacao relacionada.
- `archived`: cotacao encerrada ou descartada.

## Banco de Dados

### quotes

```text
id
client_id
created_by_user_id
product_name
hs_code
supplier_name
supplier_email
supplier_phone
fob_unit_usd
quantity
fob_total_usd
automatic_dollar
used_dollar
rpx_factor
direct_import_factor
estimated_unit_cost_rpx_brl
estimated_total_cost_rpx_brl
estimated_unit_cost_direct_brl
estimated_total_cost_direct_brl
estimated_savings_brl
estimated_savings_percent
status
created_at
updated_at
```

### quote_images

```text
id
quote_id
client_id
uploaded_by_user_id
storage_path
file_name
content_type
file_size
image_type
created_at
```

### config

```text
id
key
value
description
created_at
updated_at
```

Configuracao atual:

```text
import_factor = 1.8
```

Regras:

- `import_factor` controla o fator RPX usado no calculo.
- O valor e salvo como texto e convertido/validado como numero positivo no servidor.
- O cliente nao acessa nem visualiza essa configuracao.
- `quotes.rpx_factor` guarda o snapshot historico do valor usado na cotacao.

### calculation_parameters

Status: planejado/legado conceitual. A implementacao atual usa a tabela generica `config` para o fator RPX.

```text
id
key
name
value
description
active
created_at
updated_at
```

Parametros iniciais:

```text
default_rpx_factor = 1.8
default_direct_import_factor = 2.2
max_quote_images = 5
max_quote_image_size_mb = 5
currency_source = PTAX_BCB
```

## Regras de Permissao

### Cliente

- Pode criar cotacoes para o proprio `client_id`.
- Pode visualizar cotacoes do proprio `client_id`.
- Pode editar cotacoes em status `draft`, se esse status for usado.
- Pode anexar imagens as proprias cotacoes.
- Nao pode ver cotacoes de outros clientes.
- Nao pode alterar parametros.

### Admin RPX

- Pode visualizar todas as cotacoes.
- Pode alterar status.
- Pode criar simulacao a partir de cotacao.
- Pode editar parametros.
- Pode consultar imagens anexadas.

## Requisitos de Interface

### Mobile-first

A calculadora deve continuar excelente em tela de celular.

Prioridades:

- Campos grandes.
- Pouco atrito.
- Resultado visivel e claro.
- Botao de salvar.
- Botao de copiar.
- Upload simples de imagens.

### Desktop

No desktop, a tela pode ganhar mais respiro, mas nao deve virar dashboard complexo.

## Relacao com Simulacoes

Uma cotacao pode originar uma simulacao interna RPX.

Fluxo:

1. Cliente cria cotacao.
2. Admin abre cotacao no painel.
3. Admin cria simulacao a partir da cotacao.
4. Sistema copia dados principais da cotacao.
5. Admin adiciona dados manuais, invoice, fornecedor, despachante e custos.
6. Admin salva simulacao.
7. Admin publica simulacao para cliente.
8. Cliente visualiza no menu `Simulacoes`.

## Integracoes

### Agora

- Supabase Auth.
- Supabase Postgres.
- Supabase Storage.
- PTAX Banco Central, via API/proxy.

### Futuro

- Importacao assistida de invoice.
- OCR ou leitura estruturada de PDF/XML.
- Emissao de nota.
- Gestao de processos.
- CRM/vendas.

## Plano de Implementacao da Calculadora

### Etapa 1 - Migracao Tecnica

- Criar app Next.js + TypeScript + Tailwind.
- Replicar a calculadora atual.
- Aplicar identidade visual RPX.
- Manter formulas existentes.

### Etapa 2 - Supabase

- Criar tabelas `quotes`, `quote_images`, `calculation_parameters`.
- Criar bucket `quote-images`.
- Configurar RLS.
- Configurar variaveis de ambiente.

### Etapa 3 - Login Cliente

- Implementar login.
- Associar usuario a `client_id`.
- Proteger rotas da area do cliente.

### Etapa 4 - Nova Cotacao

- Carregar parametros do Supabase.
- Calcular resultados.
- Salvar cotacao automaticamente ao fazer o calculo.
- Exibir resultado salvo na propria tela.
- Permitir pedido de simulacao completa a partir da cotacao.
- Fazer upload de imagens em etapa posterior do Storage.

### Etapa 5 - Historico

- Listar cotacoes do cliente.
- Abrir detalhe.
- Refazer cotacao existente atualizando o registro original.
- Copiar resumo.
- Duplicar cotacao.

### Etapa 6 - Ponte com Admin

- Admin visualiza cotacoes.
- Admin muda status.
- Admin cria simulacao a partir da cotacao.

## Fora do Escopo da Calculadora

- Calculo fiscal definitivo.
- Validacao oficial automatica de NCM.
- Proposta comercial final.
- Emissao de PDF.
- Emissao de nota.
- Workflow completo de importacao.

## Criterios de Pronto

- Cliente consegue logar.
- Cliente consegue criar cotacao.
- Cliente consegue anexar imagens.
- Sistema calcula FOB total.
- Sistema calcula custo via RPX.
- Sistema calcula custo por importacao direta.
- Sistema destaca economia estimada.
- Cotacao fica salva no Supabase.
- Cliente consegue consultar historico.
- Admin consegue ver cotacao no painel.
- RLS impede acesso indevido entre clientes.
