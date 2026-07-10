# Spec CRUD Administrativo

## 1. Objetivo

Esta spec define o padrão oficial para CRUDs administrativos da plataforma Global RPX, usando o módulo de Clientes como referência técnica, visual e funcional.

O objetivo é garantir que novos módulos, como Cotações, Usuários e Simulações, sigam a mesma experiência operacional:

- mesma estrutura de página;
- mesma hierarquia visual;
- mesmos padrões de filtros, tabela, ações, formulários e feedback;
- mesma abordagem de dados com Supabase, Server Components e Server Actions;
- mesma linguagem em português brasileiro;
- evolução incremental sem criar layouts paralelos desnecessários.

Esta spec não implementa novos módulos. Ela documenta o que já existe no CRUD de Clientes e transforma esse módulo em referência para os próximos CRUDs administrativos.

## 2. Módulo Referência: Clientes

O módulo de Clientes está em:

```text
src/app/admin/clientes/page.tsx
src/app/admin/clientes/novo/page.tsx
src/app/admin/clientes/[id]/page.tsx
```

Componentes específicos do módulo:

```text
src/components/admin/ClientFilters.tsx
src/components/admin/ClientForm.tsx
src/components/admin/ClientRowActions.tsx
```

Componentes administrativos reutilizáveis:

```text
src/components/admin/CrudHeaderWithFilters.tsx
```

Componentes de UI reutilizados:

```text
src/components/layout/PageHeader.tsx
src/components/uploads/UploadsCard.tsx
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/ConfirmDialog.tsx
src/components/ui/DataTable.tsx
src/components/ui/DismissibleAlert.tsx
src/components/ui/EmptyState.tsx
src/components/ui/FormField.tsx
src/components/ui/StatusBadge.tsx
```

Camada de dados e actions:

```text
src/lib/admin/queries.ts
src/lib/actions/admin.ts
src/lib/supabase/server.ts
src/lib/supabase/admin.ts
src/lib/auth/get-session-profile.ts
```

Tipos TypeScript relacionados:

```text
AdminClientRow
AdminClientFormValues
AdminClientFilters
AdminClientPagination
AdminClientSort
AdminClientSortKey
AdminSortDirection
```

Schemas de validação:

- não há biblioteca de schema formal neste módulo;
- a validação está concentrada nas Server Actions;
- campos HTML usam `required`, `type`, `minLength` e nomes de input consistentes;
- validações de senha, confirmação e dados obrigatórios são feitas no servidor antes de persistir.

Mocks:

- o CRUD administrativo de Clientes não usa mock no fluxo atual;
- os dados vêm do Supabase;
- o modo mock ainda existe em outras áreas do projeto, mas não deve ser usado como padrão para novos CRUDs administrativos reais.

Integração com Supabase:

- listagem e busca usam `createClient()` server-side;
- criação, edição e inativação usam `createAdminClient()` e Server Actions;
- criação administrativa de cliente também cria usuário no Supabase Auth e registro em `app_users`;
- exclusão é soft delete em `clients` e também inativa usuário vinculado em `app_users`.

Dependências internas reutilizadas:

- `PageHeader` para título e descrição;
- `CrudHeaderWithFilters` para ação `Novo` e controle visual dos filtros;
- `DataTable` para tabela com rolagem horizontal interna;
- `ClientFilters` como referência de formulário de filtros;
- `ClientFormCard` como referência de formulário dedicado;
- `ClientRowActions` como referência de ações por linha;
- `ConfirmDialog` para confirmação de exclusão/inativação;
- `DismissibleAlert` para feedback fechável.

## 3. Arquitetura Padrão Dos Módulos CRUD

Cada novo CRUD administrativo deve seguir esta arquitetura base:

```text
src/app/admin/[modulo]/page.tsx
src/app/admin/[modulo]/novo/page.tsx
src/app/admin/[modulo]/[id]/page.tsx
src/components/admin/[Modulo]Filters.tsx
src/components/admin/[Modulo]Form.tsx
src/components/admin/[Modulo]RowActions.tsx
src/lib/admin/queries.ts
src/lib/actions/admin.ts
```

Quando o módulo crescer, pode ser aceitável extrair actions ou queries para arquivos próprios. Enquanto o painel ainda está enxuto, a preferência é manter o padrão existente e evitar criar uma arquitetura nova para cada CRUD.

A página principal deve ser Server Component. Ela deve:

- ler `searchParams`;
- parsear filtros;
- parsear página atual;
- chamar a query server-side;
- montar as colunas da tabela;
- renderizar header, alertas, totalizador, tabela e paginação.

Os componentes client-side devem ser usados apenas onde há interação local:

- abrir/fechar filtros;
- fechar alertas;
- abrir confirmação de ação sensível, como inativação;
- interações de formulário que exigirem estado local.

Server Actions devem ser usadas para:

- criar;
- atualizar;
- inativar por soft delete;
- criar usuários relacionados;
- sincronizar dados com Auth quando necessário.

Nem todo módulo administrativo precisa expor todas as operações no mesmo momento. Quando a regra de produto limitar o escopo, a exceção deve ficar explícita na entrega. Exemplos atuais:

- Cotações admin é uma listagem read-only; não possui criação, edição de cálculo ou exclusão no painel.
- Simulações admin possui criação e edição básica dos campos administrativos em `simulations` e upload real de múltiplos arquivos no detalhe via `UploadsCard`, tabela `uploads` e bucket privado `app-uploads`; campos textuais legados como `quote_file_url` não devem orientar novas interfaces.
- Usuários admin usa `status = inactive` para inativação nesta fase, sem preencher `deleted_at`, para permitir filtro por status, reativação e reserva de e-mail.
- Configurações admin em `/admin/configuracoes` usa um CRUD enxuto em página única para `config`: lista configurações globais, cria novas chaves e edita `value`/`description`; a `key` fica travada após a criação.

## Uploads Administrativos

Quando um CRUD administrativo precisar anexar arquivos, o padrão atual é:

- usar `public.uploads` como tabela unica de metadados;
- vincular o arquivo por FK real opcional do modulo, como `simulation_id` ou `quote_id`;
- manter `context` apenas como papel do arquivo, por exemplo `simulation_result`;
- armazenar o objeto no bucket privado `app-uploads`;
- gerar signed URL temporaria para download/visualizacao;
- validar tamanho, MIME e extensao no servidor;
- bloquear extensoes perigosas;
- evitar campos textuais novos como `file_path`, `file_url`, `arquivo_url`, `owner_type` ou `owner_id`;
- preservar campos antigos apenas como legado quando ja existirem.

Na tela `/admin/simulacoes/[id]`, o upload usa:

```text
simulation_id = simulations.id
context = simulation_result
path = simulations/{simulation_id}/{upload_id}/{safe_filename}
```

Tipos do módulo devem ficar próximos da camada de dados, hoje em `src/lib/admin/queries.ts`, até que exista volume suficiente para justificar arquivos de tipos separados.

## 4. Padrão de Listagem

O padrão de listagem é extraído de `src/app/admin/clientes/page.tsx`.

Estrutura visual:

1. `CrudHeaderWithFilters` no topo.
2. Alertas de sucesso, erro ou aviso logo abaixo do header.
3. Bloco de totalização.
4. `DataTable`.
5. Paginação, quando houver mais de uma página.

Título e subtítulo:

- título curto, no plural;
- descrição objetiva, sem texto institucional longo;
- exemplo de Clientes:

```text
Clientes
Lista consolidada dos clientes que chegaram pelo site e dos cadastros criados pela equipe.
```

Botão principal:

- label `Novo`;
- fica ao lado direito do botão de filtros;
- navega para rota dedicada `/admin/[modulo]/novo`;
- não deve abrir formulário inline na listagem.
- módulos administrativos de leitura, como Cotações nesta fase, podem omitir o botão `Novo` quando a criação não pertence ao admin;
- nesses casos, manter o botão de filtros, totalizador, tabela, ordenação, paginação e ações de leitura/detalhe.

Tabela:

- usa `DataTable`;
- container com borda, fundo branco e `rounded-lg`;
- rolagem horizontal interna em `max-w-full overflow-x-auto`;
- tabela com `min-w-[880px]`;
- página não deve gerar rolagem horizontal;
- células usam espaçamento confortável e alinhamento superior.

Colunas atuais de Clientes:

```text
Empresa
Responsável
E-mail
Origem
Tipo
Status
Cadastro
Ações
```

Formatação de colunas:

- `Empresa` é o campo principal e linka para edição;
- se não houver empresa, exibir `Pessoa física`;
- `Responsável` exibe `contact_name` ou `-`;
- `E-mail` exibe `contact_email` ou `-`;
- `Origem` mapeia `site` para `Site` e demais origens para `Painel admin`;
- `Tipo` mapeia `lead` para `Lead` e `client` para `Cliente`;
- `Status` mapeia `active` para `Ativo` e `inactive` para `Inativo`;
- `Cadastro` exibe data e hora no formato `dd/mm/aaaa - HH:mm`, por exemplo `17/06/2026 - 10:50`;
- `Ações` fica sempre por último.

Ordenação:

- Clientes ordena por `created_at desc` por padrão;
- a tabela permite ordenação clicável por coluna;
- query params usados: `sort` e `direction`;
- `direction` aceita somente `asc` ou `desc`;
- quando o sort é inválido, a página ignora o valor recebido e usa `created_at desc`;
- a ordenação sempre é validada por whitelist antes de chegar ao Supabase;
- o primeiro clique em uma coluna ainda não ativa usa `asc`;
- cliques seguintes na mesma coluna alternam entre `asc` e `desc`;
- ao ordenar, a página volta para `page=1`;
- filtros ativos são preservados ao ordenar;
- paginação preserva filtros, `sort` e `direction`;
- ordenação multi-coluna fica fora do escopo inicial.

Colunas ordenáveis de Clientes:

```text
Empresa      -> sort=company_name      -> coluna real company_name
Responsável  -> sort=responsible_name  -> coluna real contact_name
E-mail       -> sort=email             -> coluna real contact_email
Origem       -> sort=source            -> coluna real source
Tipo         -> sort=client_type       -> coluna real client_type
Status       -> sort=status            -> coluna real status
Cadastro     -> sort=created_at        -> coluna real created_at
```

A coluna `Ações` nunca deve ser ordenável.

O componente `DataTable` aceita metadados reutilizáveis:

```text
sortable
sortKey
sort
getSortHref
```

Novos módulos devem declarar explicitamente quais colunas são ordenáveis e mapear qualquer alias de URL para colunas reais e seguras da camada de dados.

Paginação:

- Clientes usa 20 registros por página;
- a query usa `range(from, to)` no Supabase;
- o total vem de `select(..., { count: "exact" })`;
- o totalizador respeita filtros ativos;
- links de página preservam query params de filtro e ordenação;
- o parâmetro `page` deve ser omitido na página 1 para manter URL limpa.

Totalizador:

- deve aparecer acima da tabela;
- deve mostrar quantidade total filtrada;
- deve mostrar faixa atual, por exemplo:

```text
16 clientes encontrados
Exibindo 1-16 de 16
```

Estado vazio:

- `DataTable` recebe `emptyLabel`;
- Clientes usa:

```text
Nenhum cliente encontrado com os filtros informados.
```

Estados de loading:

- não há skeleton/loading específico na listagem de Clientes;
- como a página é Server Component, o carregamento acontece pela navegação;
- se um módulo precisar de loading, deve usar `loading.tsx` da rota ou componente compartilhado, sem inventar padrão visual diferente.

Tratamento de erro:

- erros de actions voltam por query string `?error=...`;
- a página renderiza `DismissibleAlert` com variant `error`;
- mensagens devem ser genéricas para o usuário e específicas somente quando houver regra conhecida, como senha inválida.

Responsividade:

- layout principal usa `min-w-0` e `overflow-x-hidden`;
- tabela rola horizontalmente dentro do container;
- botões do header empilham no mobile quando necessário;
- filtros usam grid responsivo.

Densidade visual:

- interface de trabalho, não landing page;
- cards com raio de 8px (`rounded-lg`);
- espaçamento moderado;
- sem cards aninhados desnecessários;
- botões claros e previsíveis.

## 5. Padrão de Filtros

O padrão de filtros vem de:

```text
src/components/admin/CrudHeaderWithFilters.tsx
src/components/admin/ClientFilters.tsx
src/app/admin/clientes/page.tsx
```

Como funciona:

- filtros ficam ocultos por padrão;
- botão de filtro fica no header, ao lado de `Novo`;
- quando existe qualquer filtro ativo na URL, o painel abre automaticamente;
- botão de filtro exibe indicador visual quando há filtro ativo;
- filtros são enviados por query params via método GET padrão do formulário;
- não há debounce textual;
- a busca textual só acontece ao submeter o formulário.

Filtros atuais de Clientes:

```text
name
company
source
clientType
status
dateFrom
dateTo
```

Mapeamento visual:

- `Nome`: texto, busca em `contact_name`;
- `Empresa`: texto, busca em `company_name`;
- `Origem`: select com `Todas`, `Site`, `Painel admin`;
- `Tipo de cliente`: select com `Todos`, `Lead`, `Cliente`;
- `Status`: select com `Todos`, `Ativo`, `Inativo`;
- `Cadastro inicial`: input `date`;
- `Cadastro final`: input `date`.

Estado dos filtros:

- controlado pela URL;
- `parseFilters` remove campos vazios;
- filtros vazios não entram na query;
- ao aplicar filtros, preservar `sort` e `direction` atuais via campos ocultos;
- ao aplicar filtros, voltar para `page=1`;
- ao limpar filtros, remover apenas filtros e preservar ordenação ativa quando ela não for a padrão;
- ao trocar de página, preservar filtros e ordenação ativos.

Conexão com o banco:

- `name`: `ilike("contact_name", "%valor%")`;
- `company`: `ilike("company_name", "%valor%")`;
- `source`: `eq("source", valor)`;
- `clientType`: `eq("client_type", valor)`;
- `status`: `eq("status", valor)`;
- `dateFrom`: `gte("created_at", "YYYY-MM-DDT00:00:00")`;
- `dateTo`: `lte("created_at", "YYYY-MM-DDT23:59:59.999")`.

Layout:

- filtros dentro de `Card`;
- título `Filtros`;
- descrição curta;
- grid responsivo `md:grid-cols-2 xl:grid-cols-7`;
- botões `Limpar` e `Filtrar` alinhados à direita no desktop;
- botões ocupam largura total no mobile quando necessário.

Regra para novos CRUDs:

- começar com poucos filtros realmente úteis;
- usar query string, não estado local isolado;
- reaproveitar `CrudHeaderWithFilters`;
- manter botão de limpar;
- manter filtros fechados quando não houver filtro ativo;
- abrir automaticamente quando houver filtro ativo.

## 6. Padrão de Ações Por Linha

O padrão atual está em:

```text
src/components/admin/ClientRowActions.tsx
```

Ações atuais de Clientes:

```text
Editar
Inativar
```

Como aparecem:

- botões inline, não dropdown;
- `Editar` é link azul para `/admin/clientes/[id]`;
- `Inativar` é botão textual vermelho;
- ações ficam em `flex`, com `whitespace-nowrap`;
- a coluna `Ações` é a última coluna da tabela.

Inativação:

- `Inativar` abre `ConfirmDialog`;
- não usa `window.confirm`;
- modal informa:
  - título;
  - consequência;
  - identificação do registro;
  - botão `Cancelar`;
  - botão `Inativar`.

Texto atual da confirmação:

```text
Tem certeza que deseja inativar o cliente [nome]? O acesso do usuário vinculado será bloqueado, quando existir.
```

Permissões:

- a UI assume contexto admin;
- a proteção real fica em `requireAdminActionAccess()`;
- se usuário não admin chamar a action, redireciona para `/app`.

Feedback:

- depois de inativar, redireciona para `/admin/clientes?deleted=1`;
- filtros, ordenação e página atual são preservados no redirecionamento quando possível;
- se a página atual ficar vazia após a inativação, o redirecionamento volta uma página;
- página exibe `DismissibleAlert` variant `warning`;
- alertas sempre devem ter botão `X` para fechar.

Regra para próximos módulos:

- começar com `Editar` e uma ação sensível inline, como `Inativar`, quando o módulo tiver soft delete;
- usar dropdown apenas quando houver muitas ações reais;
- manter inativação/exclusão com confirmação modal;
- manter última coluna como `Ações`;
- tratar restrições na action, não apenas no botão.

## 7. Padrão de Criação

Fluxo atual:

1. Usuário clica em `Novo`.
2. Navega para `/admin/clientes/novo`.
3. Página renderiza `PageHeader`.
4. Formulário aparece em rota dedicada, não em modal.
5. Submit chama Server Action.
6. Em sucesso, redireciona para listagem com `?created=1`.
7. Listagem exibe alerta fechável.

Arquivos:

```text
src/app/admin/clientes/novo/page.tsx
src/components/admin/ClientForm.tsx
src/lib/actions/admin.ts
```

Campos atuais:

```text
Nome
Empresa
E-mail
Telefone
Tipo de cliente
Senha
Confirmar senha
```

Validações:

- `Nome` obrigatório;
- `E-mail` obrigatório e validado no servidor;
- `Empresa` opcional;
- `Telefone` opcional;
- `Tipo de cliente` usa default `Cliente` e aceita `Lead` ou `Cliente`;
- `Senha` obrigatória no cadastro administrativo de cliente;
- `Confirmar senha` obrigatória;
- senha deve ter pelo menos 6 caracteres;
- senha e confirmação devem coincidir;
- Server Action é a fonte de verdade da validação;
- validações previsíveis retornam `fieldErrors` por campo;
- o formulário preserva valores não sensíveis após erro;
- campos de senha são limpos após erro por segurança;
- erro de e-mail duplicado aparece no campo `E-mail`.

Comportamento de criação:

- cria usuário no Supabase Auth;
- cria registro em `clients` com `client_type = "client"` por padrao, salvo escolha explicita do admin;
- cria registro em `app_users` com `role = "client"`;
- vincula `app_users.client_id` ao cliente;
- usa `email_confirm: true` para usuário criado administrativamente;
- em caso de falha ao criar cliente ou app_user, remove o usuário Auth criado na tentativa para evitar registro órfão.

Feedback:

- sucesso: `Cliente cadastrado com sucesso.`;
- erros de campo: `Revise os campos destacados antes de continuar.`;
- erro inesperado: `Não foi possível salvar o cliente. Tente novamente em instantes.`;
- erros inline aparecem abaixo do campo correspondente;
- alertas usam `DismissibleAlert`.

Botões:

- `Cancelar`: secundário, volta para `/admin/clientes`;
- `Salvar cliente`: primário;
- em mobile, botões ocupam largura total e aparecem empilhados.

Regra para novos CRUDs:

- criar em rota dedicada `/admin/[modulo]/novo`;
- evitar formulário inline na listagem;
- redirecionar para listagem após sucesso;
- usar query param de feedback;
- manter formulário em card com largura limitada quando fizer sentido;
- validar no servidor mesmo que haja validação HTML;
- retornar estado estruturado nas falhas de validação para preservar valores e destacar campos.

Exceção:

- módulos read-only no admin, como Cotações na fase inicial, não devem criar rota `novo` nem botão `Novo`;
- a ação principal por linha deve abrir o detalhe, sem permitir criação, edição ou exclusão quando não houver regra aprovada.

## 8. Padrão de Edição

Fluxo atual:

1. Usuário clica no link principal da tabela ou em `Editar`.
2. Navega para `/admin/clientes/[id]`.
3. Página carrega registro server-side com `getAdminClientById`.
4. Se não encontrar, usa `notFound()`.
5. Formulário recebe valores iniciais.
6. Submit chama `updateClientAction`.
7. Em sucesso, redireciona para `/admin/clientes?updated=1`.

Arquivos:

```text
src/app/admin/clientes/[id]/page.tsx
src/components/admin/ClientForm.tsx
src/lib/admin/queries.ts
src/lib/actions/admin.ts
```

Campos preenchidos:

```text
Nome
Empresa
E-mail
Telefone
Tipo de cliente
Nova senha
Confirmar nova senha
```

Regras de senha na edição:

- campos de senha são opcionais;
- se um dos campos for preenchido, validar ambos;
- senha deve ter pelo menos 6 caracteres;
- senha e confirmação devem coincidir;
- se não existir usuário vinculado e senha for informada, retornar erro `linked-user-not-found`.

Persistência:

- atualiza `clients`;
- atualiza `app_users` vinculados;
- atualiza Supabase Auth para usuário vinculado quando `auth_provider = "supabase"`;
- sincroniza nome, email, telefone, empresa, tipo de cliente e, quando informada, senha.

Feedbacks:

- sucesso: `Cliente atualizado com sucesso.`;
- erros de campo: `Revise os campos destacados antes de continuar.`;
- usuário vinculado ausente: `Não existe usuário vinculado a este cliente para redefinir a senha.`;
- erro inesperado: `Não foi possível salvar o cliente. Tente novamente em instantes.`

Regra para novos CRUDs:

- editar em rota dedicada `/admin/[modulo]/[id]`;
- carregar dados server-side;
- usar `notFound()` quando registro não existir ou estiver excluído;
- reutilizar formulário do módulo;
- redirecionar para listagem após sucesso;
- manter alertas fecháveis.

## 9. Padrão de Exclusão/Inativação

Clientes usa soft delete, não exclusão física.

Action:

```text
softDeleteClientAction
```

Campos afetados em `clients`:

```text
status = "inactive"
deleted_at = now()
updated_at = now()
```

Quando houver usuário vinculado em `app_users`:

```text
status = "inactive"
deleted_at = now()
updated_at = now()
```

Listagem:

- filtra `.is("deleted_at", null)`;
- registros inativados por exclusão não aparecem na listagem padrão.

Confirmação:

- modal `ConfirmDialog`;
- título claro;
- consequência resumida;
- botão secundário `Cancelar`;
- botão vermelho com label da ação real, como `Inativar`.

Feedback:

- redireciona para `/admin/clientes?deleted=1`;
- preserva filtros, ordenação e paginação quando a ação veio da listagem;
- mostra alerta warning;
- alerta pode ser fechado pelo usuário.

Regra para novos CRUDs:

- nunca apagar fisicamente por padrão;
- usar `deleted_at`;
- manter `status` coerente, quando o modelo possuir status;
- preservar histórico e relacionamentos;
- se houver usuário/acesso relacionado, inativar acesso junto.

## 10. Padrão de Detalhes

O CRUD de Clientes não possui uma tela de detalhe separada.

O padrão atual é:

- campo principal da tabela abre edição;
- ação `Editar` abre a mesma rota de edição;
- a rota `/admin/clientes/[id]` funciona como tela de edição/detalhe operacional.

Para novos módulos:

- se o detalhe for somente dados editáveis, usar rota `[id]` com formulário;
- se houver detalhe rico, histórico ou anexos, pode haver uma tela de detalhe com cards, desde que mantenha o header, alertas e ações no mesmo padrão;
- não exibir detalhe abaixo da tabela por padrão;
- se o detalhe for modal, deve ser usado apenas quando a leitura rápida fizer mais sentido que navegação.

## 11. Padrão de Dados, Services e Integração Com Supabase

Busca de dados:

- usar `createClient()` em Server Components/queries;
- concentrar queries administrativas em `src/lib/admin/queries.ts`;
- retornar tipos claros para linhas e formulários;
- sempre filtrar `deleted_at` quando o módulo usar soft delete;
- usar ordenação server-side.

Clientes:

```text
getAdminClients(filters, pagination)
getAdminClientById(id)
```

Paginação:

- `page` começa em 1;
- `perPage` padrão de Clientes é 20;
- usar `range(from, to)`;
- usar `count: "exact"` quando houver totalizador;
- retornar `{ rows, total, page, perPage }`.

Actions:

- usar Server Actions em `src/lib/actions/admin.ts`;
- proteger actions com `requireAdminActionAccess()`;
- redirecionar em sucesso;
- em formulários de criação/edição, retornar estado estruturado quando houver erro previsível;
- sanitizar inputs com `trim()`;
- normalizar email com `toLowerCase()`.

Clientes:

```text
createClientAction(previousState, formData)
updateClientAction(previousState, formData)
softDeleteClientAction(formData)
```

Estado de formulário:

- `values` preserva dados não sensíveis digitados;
- `fieldErrors` destaca campos específicos;
- `message` mostra resumo geral no topo do formulário;
- senha e confirmação podem ser limpas após erro;
- e-mail duplicado deve virar erro inline em `E-mail`.

Autenticação e permissões:

- `requireAdminActionAccess()` consulta `getSessionProfile()`;
- se `role !== "admin"`, redireciona para `/app`;
- a UI não substitui a proteção server-side.

Erros:

- actions de formulário retornam mensagens amigáveis e erros por campo;
- actions de operações sem formulário, como inativação, podem redirecionar com `?error=...`;
- erros genéricos não devem expor detalhes sensíveis;
- detalhes de banco não devem ser exibidos ao usuário;
- unique violation, erro do Auth ou constraint de e-mail devem ser convertidos em erro inline no campo de e-mail.

Supabase Admin:

- `createAdminClient()` usa `SUPABASE_SERVICE_ROLE_KEY`;
- nunca importar service role em componente client;
- operações de Auth admin devem ficar em Server Actions ou funções server-only.

## 12. Padrão Visual e Componentes Reutilizáveis

Hierarquia:

- `PageHeader` para título e descrição;
- título em `text-3xl font-bold text-rpx-ink`;
- descrição em texto pequeno, `text-slate-600`;
- ação do header alinhada à direita no desktop.

Cards:

- `Card` usa `rounded-lg`, borda slate, fundo branco e `shadow-soft`;
- títulos de card usam uppercase pequeno;
- descrições devem ser curtas.

Tabela:

- `DataTable` com borda e fundo branco;
- rolagem horizontal interna;
- cabeçalho com fundo `bg-slate-50`;
- células com `px-4 py-4`;
- coluna principal como link azul.

Inputs:

- usar `FormField`;
- usar `TextInput`, `NumberInput` ou `SelectInput`;
- altura padrão `h-11`;
- foco com borda azul e ring suave;
- labels objetivas;
- texto de ajuda curto.

Botões:

- primário: `Button` padrão, azul RPX;
- secundário: `variant="secondary"`;
- ações destrutivas: texto vermelho ou botão vermelho no modal;
- botões devem ter labels claros em português.

Badges/status:

- usar `src/components/ui/StatusBadge.tsx`;
- Clientes usa badge para `Ativo` e `Inativo`;
- usar variante `success` para status ativo;
- usar variante neutra para status inativo ou sem destaque operacional;
- novos módulos devem reutilizar o componente antes de criar estilos próprios de status.

Modais:

- `ConfirmDialog` para inativação, exclusão ou ação sensível;
- overlay `bg-slate-950/40`;
- modal branco, `max-w-md`, borda, `rounded-lg`, `shadow-soft`;
- evitar modais para formulários principais de criação/edição no CRUD padrão.

Alertas:

- usar `DismissibleAlert`;
- variantes atuais: success, error, warning;
- todos os alertas devem ter botão `X`;
- alertas ficam abaixo do header.

Linguagem:

- português brasileiro;
- tom direto e operacional;
- exemplos:
  - `Cliente cadastrado com sucesso.`
  - `Cliente atualizado com sucesso.`
  - `Cliente inativado com sucesso.`
  - `Não foi possível concluir a operação. Revise os dados e tente novamente.`

## 13. Regras Para Novos Módulos

Regras obrigatórias:

- não criar layout novo se o padrão de Clientes atender;
- reutilizar `CrudHeaderWithFilters`, `DataTable`, `Card`, `Button`, `FormField`, `ConfirmDialog` e `DismissibleAlert` sempre que possível;
- manter listagem, filtros e ações com a mesma estrutura;
- manter coluna `Ações` como última coluna;
- manter campo principal clicável para edição ou detalhe principal;
- usar filtros por query string;
- manter botão de filtro no header ao lado de `Novo`;
- abrir painel de filtros automaticamente quando houver filtro ativo;
- manter totalizador respeitando filtros;
- usar paginação de 20 itens por página, salvo decisão explícita em contrário;
- preservar filtros e ordenação nos links de paginação;
- implementar ordenação por coluna quando houver tabela de listagem;
- controlar ordenação por query params `sort` e `direction`;
- validar `sort` por whitelist antes de enviar ao banco;
- mapear aliases de URL para nomes reais e seguros da camada de dados;
- ignorar ordenação inválida e voltar para ordenação padrão do módulo;
- implementar criação em `/admin/[modulo]/novo`, exceto quando o módulo for explicitamente read-only;
- implementar edição ou detalhe principal em `/admin/[modulo]/[id]`, conforme o escopo do módulo;
- não usar formulário inline dentro da listagem para criação;
- usar soft delete por padrão quando houver exclusão/inativação no escopo;
- sempre confirmar ações destrutivas com modal quando houver ação destrutiva;
- alertas de sucesso, aviso e erro devem ser fecháveis;
- formulários devem exibir validação inline por campo para erros previsíveis;
- falhas de validação devem preservar valores não sensíveis preenchidos;
- usar labels, botões e mensagens em português brasileiro;
- manter tipagem TypeScript;
- validar no servidor;
- proteger actions administrativas com `requireAdminActionAccess()` ou equivalente;
- proteger queries administrativas server-side com `requireRole("admin")` ou equivalente;
- usar Supabase server-side para queries e service role apenas no servidor;
- garantir `npm run typecheck` e `npm run lint` sem erros.

Regras de organização:

- nomes de páginas seguem App Router;
- componentes específicos seguem prefixo do módulo, como `ClientFilters`, `ClientForm`, `ClientRowActions`;
- funções de query seguem `getAdmin[Modulo]` e `getAdmin[Modulo]ById`;
- actions seguem verbos claros, como `create[Modulo]Action`, `update[Modulo]Action`, `softDelete[Modulo]Action`;
- tipos seguem `Admin[Modulo]Row`, `Admin[Modulo]Filters`, `Admin[Modulo]FormValues`;
- evitar duplicar helpers como paginação, filtros ou alertas; se repetir em outro módulo, extrair componente/helper compartilhado.

Fora do escopo inicial de cada CRUD, salvo pedido explícito:

- exportação Excel;
- ações em massa;
- ordenação multi-coluna;
- restauração de registros excluídos;
- auditoria detalhada;
- permissões granulares por ação;
- dashboards específicos dentro de cada módulo.

Checklist mínimo antes de considerar um CRUD administrativo pronto:

- página principal com header, filtro, totalizador, tabela e paginação;
- criação em rota dedicada;
- edição em rota dedicada;
- exclusão/inativação com confirmação;
- feedbacks fecháveis;
- validação inline por campo em criação/edição;
- preservação de dados preenchidos após erro de formulário;
- tratamento amigável para duplicidade de e-mail quando aplicável;
- estado vazio;
- rolagem horizontal apenas dentro da tabela;
- filtros persistidos na URL;
- ordenação por coluna persistida na URL;
- whitelist de sort usando colunas reais da camada de dados;
- query filtrada, ordenada e paginada no banco;
- links preservam filtros, sort e paginação quando aplicável;
- status exibido com badge compartilhado quando houver campo de status;
- actions protegidas por perfil admin;
- queries protegidas por perfil admin no server-side;
- soft delete/inativação documentado quando não houver exclusão física;
- documentação ou nota no `state.md` quando o módulo mudar o padrão.

Nota para usuarios administrativos:

- o CRUD de usuarios admin gerencia somente `app_users.role = 'admin'`;
- clientes nao devem aparecer neste modulo;
- inativacao de admin usa `status = inactive`, mantendo `deleted_at` nulo nesta fase;
- reativacao volta `status = active`;
- auto-inativacao deve ser bloqueada no servidor;
- criacao e edicao devem sincronizar Supabase Auth e `app_users` quando `auth_provider = 'supabase'`.
