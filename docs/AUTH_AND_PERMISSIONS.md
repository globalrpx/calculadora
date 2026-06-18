# Global RPX - Autenticacao e Permissoes

## Implementacao Atual

O provedor principal de autenticacao e o Supabase Auth. Quando as variaveis publicas do Supabase nao existem, o sistema usa modo mock por cookie como fallback local/preview.

Fonte de verdade da aplicacao:

- `app_users`: perfil da aplicacao, role, status, `client_id`, provedor de auth e vinculo com usuario do Supabase.
- `profiles`: legado da fundacao inicial. Nao deve ser usado como fonte principal em novas implementacoes.

## Variaveis e Service Role

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Regras:

- `NEXT_PUBLIC_*` podem ser usadas pelo client.
- `SUPABASE_SERVICE_ROLE_KEY` so pode ser usada server-side.
- Nunca importar service role em Client Components.
- Operacoes privilegiadas devem ficar em Server Actions, Route Handlers ou funcoes server-only.

## Modo Mock / Preview

No fallback mock, a sessao usa o cookie HTTP-only:

```text
global_rpx_mock_user
```

Usuarios mock:

- `cliente1@gmail.com`
- `cliente2@gmail.com`
- `admin@globalrpx.com`

Esse modo nao e o fluxo principal quando Supabase real esta configurado.

## Roles Atuais

### Cliente

Role: `client`.

Pode:

- Acessar `/app` e descendentes.
- Acessar `/conta`.
- Criar cotacoes para o proprio `client_id`.
- Ver apenas o proprio historico.
- Solicitar simulacao completa a partir de cotacao propria.
- Ver simulacoes/solicitacoes vinculadas ao proprio cliente.

Nao pode:

- Acessar `/admin`.
- Ver dados de outro cliente.
- Ver fatores, markup cambial, PTAX interna ou notas internas.
- Alterar validacao Brasil, impostos, parametros ou status administrativo.
- Publicar simulacoes.

### Administrador RPX

Role: `admin`.

Pode:

- Acessar `/admin` e descendentes.
- Ver dashboard administrativo.
- Gerenciar Clientes pelo CRUD administrativo.
- Ver cotacoes e simulacoes em bases administrativas iniciais.
- Gerenciar usuarios admin em base inicial.
- Futuramente, validar NCM, impostos, parametros e publicar simulacoes.

Nao deve:

- Executar operacoes privilegiadas pelo browser usando service role.
- Confiar em dados sensiveis vindos do client sem validacao server-side.
- Alterar dados sensiveis sem rastreabilidade quando a funcao exigir auditoria.

## Redirecionamento Esperado

- Usuario deslogado tentando acessar rota interna vai para `/login`.
- `admin` autenticado vai para `/admin/dashboard`.
- `client` autenticado vai para `/app`.
- Admin tentando acessar `/app` volta para `/admin/dashboard`.
- Cliente tentando acessar `/admin` volta para `/app`.
- Usuario inativo ou com `deleted_at` em `app_users` nao deve acessar rotas internas.

## Telas Protegidas

Cliente:

- `/app`
- `/app/calculadora`
- `/app/simulacoes`
- `/conta`

Admin:

- `/admin`
- `/admin/dashboard`
- `/admin/clientes`
- `/admin/clientes/novo`
- `/admin/clientes/[id]`
- `/admin/cotacoes`
- `/admin/simulacoes`
- `/admin/usuarios`
- `/admin/fornecedores`
- `/admin/despachantes`
- `/admin/parametros`

## Camadas de Protecao

1. Middleware atualiza sessao Supabase.
2. Rotas internas exigem sessao.
3. Layouts e paginas usam `requireRole`.
4. Queries administrativas devem validar role server-side.
5. Server Actions sensiveis devem validar permissao no servidor.
6. RLS aplica isolamento no banco.
7. Storage policies devem repetir o isolamento por `client_id` quando Storage real for consolidado.

Middleware e interface nao substituem RLS.

## Regras de Banco e RLS

- Toda tabela de negocio que possui dados de cliente deve ter `client_id`.
- `client_id` deve vir da sessao/perfil da aplicacao, nunca de payload confiado.
- Cliente le e altera apenas registros do proprio `client_id`, quando a action/policy permitir.
- Admin passa por verificacao server-side e/ou funcao `is_admin()`.
- A funcao `is_admin()` atual usa `app_users`, role `admin`, status `active` e vinculo com `auth.uid()`.
- Soft delete/inativacao usa `deleted_at` quando aplicavel.

## CRUD Administrativo de Clientes

O CRUD de Clientes e a referencia atual:

- Criacao administrativa cria usuario no Supabase Auth, registro em `clients` e registro em `app_users`.
- Edicao sincroniza dados do cliente, `app_users` e Auth quando aplicavel.
- Senha e opcional na edicao.
- Inativacao usa soft delete em `clients` e inativa usuario vinculado em `app_users`.
- Validacao server-side e fonte de verdade.
- Erros previsiveis aparecem inline por campo.

Detalhes de padrao ficam em `docs/spec-cruds.md`.

## Arquivos e Storage

Storage real para imagens/anexos esta preparado como direcao de arquitetura, mas ainda precisa ser consolidado com bucket, metadados e policies.

Direcao esperada:

```text
quote-images/{client_id}/{quote_id}/{type}/{file}
```

Policies devem verificar:

- usuario pertence ao `client_id` do caminho;
- admin pode acessar conforme regra operacional;
- tipo e tamanho sao validados no servidor.

## Cuidados

- Nunca confiar em role enviada pelo cliente.
- Nunca usar `SUPABASE_SERVICE_ROLE_KEY` em Client Components.
- Nao usar `profiles` como fonte principal.
- Evitar dados sensiveis em localStorage.
- Nao expor fatores, markup cambial, PTAX interna ou notas internas ao cliente.
- Testar RLS com dois clientes diferentes antes de producao.
- Seguir `agents.md` para classificacao de risco e aprovacao antes de mudancas sensiveis.
