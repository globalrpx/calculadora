# Global RPX - Autenticacao e Permissoes

## Implementacao atual

O sistema possui dois modos:

1. **Mock**: ativado quando as variaveis publicas do Supabase nao existem.
2. **Supabase Auth**: ativado quando URL e anon key estao configuradas.

No mock, a sessao usa o cookie HTTP-only:

```text
global_rpx_mock_user
```

Usuarios mock:

- `cliente1@gmail.com`
- `cliente2@gmail.com`
- `admin@globalrpx.com`

## Tipos de usuario

### Cliente

Role atual: `client`.

Pode:

- Acessar `/app` e descendentes.
- Criar cotacoes do proprio cliente.
- Ver apenas o proprio historico.
- Ver simulacoes publicadas para o proprio cliente.
- Anexar imagens e dados de fornecedor.

Nao pode:

- Acessar `/admin`.
- Ver dados de outro cliente.
- Ver fatores, markup cambial ou notas internas.
- Alterar validacao Brasil, impostos ou parametros.
- Publicar simulacoes.

### Administrador RPX

Role atual: `admin`.

Pode:

- Acessar `/admin` e descendentes.
- Ver e gerenciar todos os clientes.
- Ver todas as cotacoes.
- Validar NCM, impostos e status.
- Gerenciar parametros.
- Criar e publicar simulacoes.
- Gerenciar usuarios e fornecedores.

Nao deve:

- Executar operacoes privilegiadas pelo browser usando service role.
- Alterar dados sem registro de autoria quando a funcao for sensivel.

## Telas protegidas

Cliente:

- `/app`
- `/app/calculadora`
- `/app/simulacoes`
- Futuras rotas `/app/cotacoes/*` e `/app/simulacoes/*`.

Admin:

- `/admin`
- `/admin/dashboard`
- `/admin/clientes`
- `/admin/fornecedores`
- `/admin/despachantes`
- `/admin/usuarios`
- `/admin/parametros`
- `/admin/cotacoes`
- `/admin/simulacoes`

## Camadas de protecao

1. `middleware.ts` chama `updateSession`.
2. O middleware exige sessao nas rotas internas.
3. Layouts chamam `requireRole`.
4. Supabase RLS deve aplicar isolamento no banco.
5. Storage policies devem repetir o isolamento.

Middleware e interface nao substituem RLS.

## Regras recomendadas no Supabase

### Perfil

- Usuario autenticado pode ler o proprio perfil.
- Admin pode ler todos os perfis.
- Edicao de role deve ocorrer somente por operacao administrativa server-side.

### Dados de cliente

- Toda tabela de negocio deve possuir `client_id`.
- Inserts de cliente devem validar `client_id = current_client_id()`.
- Updates e deletes seguem a mesma regra.
- Admin passa pela politica `is_admin()`.

### Cotacoes

- Cliente cria, le e atualiza apenas cotacoes proprias em estados permitidos.
- Apos `submitted`, limitar campos que o cliente pode alterar ou criar uma nova versao.
- Admin altera status e campos de validacao.

### Simulacoes

- Cliente le apenas simulacoes `published`.
- Admin possui acesso completo.
- Notas internas nunca entram em views ou selects do cliente.

### Arquivos

Estrutura:

```text
quote-images/{client_id}/{quote_id}/{type}/{file}
```

Policies verificam:

- Usuario pertence ao `client_id` do caminho.
- Admin pode acessar todos.
- Tipos e tamanho sao validados no servidor.

## Fluxos futuros de Auth

- Convite de usuarios por e-mail.
- Recuperacao de senha.
- Confirmacao de e-mail.
- Desativacao sem apagar historico.
- Eventual MFA para administradores.
- Roles mais granulares: `admin`, `commercial`, `operations`, `tax`, `client`.

## Cuidados

- Nunca confiar em role enviada pelo cliente.
- Nunca usar `SUPABASE_SERVICE_ROLE_KEY` em Client Components.
- Evitar armazenar dados sensiveis em localStorage.
- Registrar `created_by`, `updated_by` e historico de status.
- Testar RLS com dois clientes diferentes antes do deploy.

