# Visao Geral do Produto - Plataforma Global RPX

## Objetivo

Construir uma plataforma web enxuta para a Global RPX centralizar cotacoes preliminares, simulacoes internas e relacionamento operacional com clientes, fornecedores e despachantes.

O primeiro modulo funcional sera a calculadora de custo estimado Brasil. Depois, a plataforma evolui para simulacoes detalhadas feitas pelo time RPX, dashboard administrativo, gestao comercial, gestao de processos e integracoes operacionais.

## Principio do Produto

A plataforma nao deve nascer como ERP completo. Ela deve comecar como uma ferramenta objetiva para:

- Cadastrar e gerenciar clientes.
- Permitir que clientes facam login.
- Permitir que clientes criem cotacoes preliminares.
- Permitir que a RPX analise, simule e complemente essas cotacoes.
- Exibir para o cliente o historico de cotacoes e simulacoes.
- Destacar o beneficio economico de comprar via RPX.

## Perfis de Usuario

### Administrador RPX

Usuario interno com acesso ao painel administrativo.

Responsabilidades:

- Gerenciar clientes.
- Gerenciar usuarios administradores.
- Gerenciar fornecedores.
- Gerenciar despachantes.
- Gerenciar parametros usados na calculadora.
- Visualizar cotacoes dos clientes.
- Criar e editar simulacoes internas.
- Importar dados de invoice, inicialmente de forma manual ou assistida.
- Publicar simulacoes para o cliente.

### Cliente

Usuario externo com acesso restrito a area do cliente.

Responsabilidades:

- Acessar a calculadora.
- Criar novas cotacoes.
- Anexar imagens de produtos.
- Consultar historico das proprias cotacoes.
- Consultar simulacoes preparadas pela RPX.
- Visualizar comparativos e economia estimada via RPX.

### Futuro: Operacional / Comercial RPX

Perfis internos com permissoes especificas para acompanhar processos, vendas, propostas, documentos e faturamento.

## Modulos do Sistema

### 1. Painel Administrativo RPX

Area interna para gestao da operacao.

Funcionalidades iniciais:

- Cadastro de clientes.
- Cadastro de fornecedores.
- Cadastro de despachantes.
- Cadastro de usuarios administradores.
- Gestao de parametros comerciais e operacionais.
- Dashboard inicial de cotacoes e simulacoes.
- Listagem e detalhe de cotacoes.
- Criacao de simulacoes internas.

Funcionalidades futuras:

- Gestao de vendas.
- Gestao de processos de importacao.
- Integracao com emissao de nota.
- Relatorios operacionais.
- Pipeline comercial.
- Permissoes avancadas por perfil.

### 2. Area do Cliente

Area autenticada para clientes.

Menus iniciais:

- Calculadora.
- Simulacoes.

#### Calculadora

Cliente cria uma cotacao preliminar informando produto, NCM/HS sugerido, FOB, quantidade, dolar, fator RPX e imagens.

#### Simulacoes

Cliente visualiza simulacoes preparadas e publicadas pelo time RPX, com dados mais completos que a calculadora preliminar.

### 3. Simulacoes RPX

Modulo administrativo onde o time RPX monta uma analise mais detalhada.

Entradas previstas:

- Cotacao de origem do cliente, quando houver.
- Dados manuais.
- Dados de invoice.
- Dados de fornecedor.
- Despachante envolvido.
- Custos operacionais.
- Parametros comerciais.
- Observacoes internas.

Saidas previstas:

- Simulacao salva.
- Historico de versoes ou atualizacoes.
- Resultado publicado para o cliente.
- Comparativo de custo via RPX versus importacao direta.

## Stack Recomendada

### Aplicacao

- Next.js.
- TypeScript.
- Tailwind CSS.
- React Server Components quando fizer sentido.
- Deploy na Vercel.

### Backend e Dados

- Supabase Auth.
- Supabase Postgres.
- Supabase Storage.
- Supabase Row Level Security.
- Supabase Edge Functions apenas quando necessario.

### Arquivos e Imagens

- Supabase Storage para imagens de cotacoes, invoices e anexos futuros.

### Ambientes

- Desenvolvimento local.
- Supabase project de desenvolvimento.
- Deploy preview na Vercel.
- Producao quando a base estiver validada.

## Estrutura de Navegacao Inicial

```text
/login
/app
/app/calculadora
/app/cotacoes
/app/cotacoes/[id]
/app/simulacoes
/app/simulacoes/[id]

/admin
/admin/dashboard
/admin/clientes
/admin/fornecedores
/admin/despachantes
/admin/usuarios
/admin/parametros
/admin/cotacoes
/admin/cotacoes/[id]
/admin/simulacoes
/admin/simulacoes/[id]
```

## Modelo de Dados Inicial

### app_users

Representa o usuario da aplicacao e deve permanecer independente do provedor de autenticacao. O provedor autentica; a plataforma controla perfis, papeis, relacao com cliente e futuras operacoes administrativas sobre a base de usuarios.

```text
id
name
email
phone
role
status
client_id
auth_provider
auth_provider_user_id
accepted_terms_at
created_at
updated_at
```

Roles iniciais:

- `admin`
- `client`

### clients

Clientes cadastrados pela RPX.

```text
id
company_name
trade_name
document
contact_name
contact_email
contact_phone
status
created_at
updated_at
```

### suppliers

Fornecedores cadastrados pela RPX.

```text
id
name
country
city
contact_name
contact_email
contact_phone
notes
created_at
updated_at
```

### customs_brokers

Despachantes cadastrados pela RPX.

```text
id
name
company_name
document
contact_email
contact_phone
notes
created_at
updated_at
```

### calculation_parameters

Parametros gerenciados pela RPX.

```text
id
name
key
value
description
active
created_at
updated_at
```

Exemplos:

- `default_rpx_factor`
- `default_direct_import_factor`
- `max_quote_images`
- `default_currency_source`

### quotes

Cotacoes preliminares criadas pelo cliente ou pela RPX.

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

Imagens anexadas a uma cotacao.

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

Tipos iniciais de imagem:

- `product`
- `supplier_contact`

### simulations

Simulacoes montadas internamente pela RPX.

```text
id
client_id
quote_id
supplier_id
customs_broker_id
created_by_admin_id
title
status
invoice_number
invoice_date
currency
exchange_rate
total_fob_usd
total_estimated_rpx_brl
total_estimated_direct_brl
estimated_savings_brl
estimated_savings_percent
internal_notes
client_notes
published_at
created_at
updated_at
```

### simulation_items

Itens de uma simulacao.

```text
id
simulation_id
product_name
hs_code
quantity
fob_unit_usd
fob_total_usd
estimated_unit_cost_brl
estimated_total_cost_brl
created_at
updated_at
```

### simulation_files

Anexos de simulacoes, como invoice e imagens.

```text
id
simulation_id
uploaded_by_user_id
storage_path
file_name
content_type
file_size
file_type
created_at
```

## Status Sugeridos

### Cotacoes

```text
draft
submitted
under_review
simulated
archived
```

### Simulacoes

```text
draft
internal_review
published_to_client
archived
```

## Permissoes e Seguranca

### Cliente

- Visualiza apenas dados ligados ao proprio `client_id`.
- Cria cotacoes para o proprio cliente.
- Visualiza simulacoes publicadas para o proprio cliente.
- Nao acessa cadastros administrativos.

### Admin RPX

- Visualiza todos os clientes, cotacoes e simulacoes.
- Gerencia parametros.
- Cria e publica simulacoes.
- Gerencia fornecedores, despachantes e usuarios.

### Supabase RLS

Regras essenciais:

- `profiles`: usuario ve o proprio perfil; admin ve todos.
- `app_users`: usuario ve o proprio cadastro de aplicacao; admin ve todos.
- `clients`: cliente ve apenas o proprio cadastro; admin ve todos.
- `quotes`: cliente ve apenas cotacoes do proprio `client_id`; admin ve todos.
- `quote_images`: segue permissao da cotacao.
- `simulations`: cliente ve apenas simulacoes publicadas do proprio `client_id`; admin ve todas.
- `simulation_files`: segue permissao da simulacao.

## Roadmap de Implementacao

### Fase 1 - Fundacao

- Migrar para Next.js, TypeScript e Tailwind.
- Configurar Supabase.
- Configurar Vercel.
- Criar Auth.
- Criar tabelas principais.
- Implementar RLS inicial.

### Fase 2 - Calculadora com Login

- Login do cliente.
- Area do cliente.
- Nova cotacao.
- Historico de cotacoes.
- Upload de imagens.
- Calculo de economia via RPX.
- Persistencia no Supabase.

### Fase 3 - Admin Basico

- Login admin.
- Dashboard administrativo simples.
- Cadastro de clientes.
- Cadastro de fornecedores.
- Cadastro de despachantes.
- Gestao de parametros.
- Visualizacao das cotacoes.

### Fase 4 - Simulacoes

- Criar simulacao a partir de uma cotacao.
- Criar simulacao manual.
- Importar/anexar invoice.
- Cadastrar itens da simulacao.
- Salvar historico.
- Publicar simulacao para o cliente.
- Cliente visualiza simulacoes publicadas.

### Fase 5 - Evolucao Operacional

- Relatorios.
- Gestao de vendas.
- Gestao de processos.
- Integracao com emissao de nota.
- Dashboards avancados.
- Permissoes refinadas.

## Fora do Escopo Inicial

- ERP completo.
- Emissao de nota fiscal.
- Calculo fiscal definitivo.
- Classificacao oficial automatica de NCM.
- Integracao direta com Mercado Livre.
- CRM completo.
- Workflow operacional completo de importacao.

## Observacoes Importantes

- NCM/HS Code deve ser tratado como campo preliminar ate validacao fiscal.
- A economia via RPX deve ser apresentada como estimativa comercial preliminar.
- A calculadora deve continuar simples, rapida e mobile-first.
- O admin pode crescer aos poucos, mas a primeira entrega deve favorecer cadastro, parametros e leitura das cotacoes.
