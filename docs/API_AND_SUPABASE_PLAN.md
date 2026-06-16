# Global RPX - Plano de API e Supabase

## Principio

Usar Supabase diretamente com RLS para consultas simples e Server Actions/Route Handlers para operacoes que:

- Usam parametros internos.
- Fazem chamadas externas.
- Exigem transacao ou validacao complexa.
- Enviam notificacoes.
- Precisam ocultar campos do cliente.

## Dados que devem ser salvos

- Clientes e perfis.
- Produtos pesquisados.
- Fornecedores e contatos.
- Cotacoes e snapshots dos dados informados.
- Resultado do calculo e versao da formula.
- PTAX, taxa ajustada e fatores usados, somente como dados internos.
- Anexos e metadados.
- Status e historico de validacao Brasil.
- Parametros administrativos versionados.
- Simulacoes e versoes publicadas.
- NCM validado e regras tributarias futuras.

## Operacoes necessarias

### Auth

- `signInWithPassword`.
- `signOut`.
- Criar/convidar usuario.
- Consultar perfil atual.
- Desativar acesso sem excluir historico.

### Cotacoes

- `createQuote(input)`.
- `calculateQuote(input)` no servidor.
- `saveQuoteWithCalculation(input, result)` em transacao.
- `listClientQuotes(filters)`.
- `getClientQuote(id)`.
- `listAdminQuotes(filters)`.
- `updateQuoteStatus(id, status, comment)`.
- `requestMoreInformation(id, comment)`.

### Fornecedores

- `createSupplier`.
- `updateSupplier`.
- `findSupplierByEmailOrName`.
- `linkSupplierToQuote`.
- `listClientSuppliers`.
- Futuramente, mesclar duplicados.

### Simulacoes

- `createSimulationFromQuote`.
- `saveSimulationVersion`.
- `publishSimulation`.
- `listPublishedClientSimulations`.
- `getPublishedSimulation`.

### Parametros

- `getActiveCalculationParameters`.
- `createParameterVersion`.
- `listParameterHistory`.

## Integracao de dolar

Atual:

- Endpoint: `GET /api/exchange-rate`.
- Fonte: servico PTAX OData do Banco Central.
- Busca: PTAX venda mais recente dentro dos ultimos dez dias.
- Cache: `no-store`.
- Ajuste atual: 3% aplicado server-side.

Fluxo recomendado:

1. Cliente envia dados da cotacao.
2. Server Action valida dados e permissao.
3. Servidor busca PTAX.
4. Servidor busca parametros ativos.
5. Servidor calcula.
6. Servidor salva cotacao e snapshot do calculo.
7. Resposta ao cliente contem apenas os valores publicos.

Melhorias:

- Timeout explicito.
- Log de falhas sem expor dados ao cliente.
- Registrar PTAX original e horario no snapshot.
- Tornar o markup um parametro administrativo.
- Definir politica de fallback aprovada pelo negocio; nao usar taxa silenciosamente desatualizada.

## Como salvar simulacoes

Separar identidade e versao:

- `simulations`: cabecalho, cliente, cotacao, status e versao atual.
- `simulation_versions`: entradas, resultados e notas de cada versao.

Ao publicar:

1. Validar permissao admin.
2. Congelar a versao.
3. Atualizar `simulations.status = 'published'`.
4. Definir `published_at`.
5. Disponibilizar apenas campos publicos ao cliente.
6. Registrar auditoria/notificacao.

## Como salvar fornecedores

Durante a cotacao:

- Permitir snapshot dos dados, mesmo sem fornecedor consolidado.
- Se houver dados suficientes, criar ou vincular `supplier_id`.
- Anexar cartao em `quote_attachments`.
- Futuramente, OCR sugere dados, mas exige confirmacao humana.

Snapshots em `quotes` preservam o que foi informado mesmo se o cadastro do fornecedor mudar.

## Separacao por cliente

Regras obrigatorias:

- Todas as tabelas de negocio possuem `client_id`.
- `client_id` vem do perfil autenticado, nunca do payload confiado.
- RLS compara com `current_client_id()`.
- Admin usa `is_admin()`.
- Queries do cliente selecionam explicitamente apenas campos publicos.
- Arquivos usam caminho iniciado por `client_id`.

## Supabase Storage

Bucket privado:

```text
quote-images
```

Caminho:

```text
{client_id}/{quote_id}/product/{uuid}-{filename}
{client_id}/{quote_id}/supplier-contact/{uuid}-{filename}
```

Usar URLs assinadas para leitura temporaria.

## Integracoes futuras

- Base oficial NCM/Portal Unico.
- Fonte confiavel de aliquotas e regras fiscais.
- OCR/visao para cartoes e invoices.
- E-mail transacional para convites e status.
- CRM.
- Emissao fiscal ou ERP, apenas em fase posterior.
- Analytics e observabilidade.

## Endpoints/acoes recomendados

Preferir Server Actions para formularios autenticados e Route Handlers para integracoes HTTP.

```text
GET  /api/exchange-rate
POST /api/uploads/sign
POST /api/webhooks/supabase
```

Nao criar uma API REST paralela para tudo sem necessidade; o App Router e o cliente Supabase ja cobrem grande parte do MVP.

