# Plano de Fundacao do Sistema - Global RPX

## Objetivo desta etapa

Criar a fundacao tecnica e visual da plataforma Global RPX, ja conectada ao Supabase e pronta para deploy na Vercel.

Esta etapa nao deve implementar a calculadora completa ainda. O objetivo e validar a estrutura geral do produto:

- Landing page publica.
- Login.
- Area administrativa RPX.
- Area do cliente.
- Navegacao principal.
- Layout base responsivo.
- Conexao com Supabase.
- Deploy inicial na Vercel.

Depois que essa fundacao estiver validada, a proxima etapa sera implementar o modulo de Calculadora.

## Stack alvo

- Next.js.
- TypeScript.
- Tailwind CSS.
- Supabase Auth.
- Supabase Postgres.
- Supabase Storage preparado, mas sem uso profundo nesta etapa.
- Vercel para deploy.

## Resultado esperado

Ao final desta etapa, deve existir uma aplicacao online na Vercel com:

```text
/
/login
/app
/app/calculadora
/app/simulacoes
/admin
/admin/dashboard
/admin/clientes
/admin/fornecedores
/admin/despachantes
/admin/usuarios
/admin/parametros
/admin/cotacoes
/admin/simulacoes
```

As telas internas podem ter conteudo placeholder, mas a navegacao, autenticacao e estrutura visual precisam estar funcionando.

## Escopo desta etapa

### 1. Landing Page

Rota:

```text
/
```

Objetivo:

- Apresentar a Global RPX.
- Comunicar a proposta da plataforma.
- Ter CTA para login.

Conteudo inicial sugerido:

- Logo RPX.
- Headline simples.
- Texto curto sobre cotacoes, simulacoes e importacao com apoio RPX.
- Botao `Entrar na plataforma`.

Nao precisa ser uma landing page longa. Deve ser objetiva e profissional.

### 2. Autenticacao

Rota:

```text
/login
```

Requisitos:

- Login com e-mail e senha via Supabase Auth.
- Logout.
- Redirecionamento apos login baseado no perfil do usuario:
  - `admin` vai para `/admin/dashboard`.
  - `client` vai para `/app`.
- Usuario deslogado nao acessa rotas internas.

### 3. Area do Cliente

Rotas:

```text
/app
/app/calculadora
/app/simulacoes
```

Layout:

- Header com logo RPX.
- Menu lateral ou menu superior responsivo.
- Menu mobile simples.
- Identificacao do usuario logado.
- Botao de sair.

Menus iniciais:

- Calculadora.
- Simulacoes.

Conteudo placeholder:

#### `/app`

Resumo simples:

- Boas-vindas.
- Cards estaticos:
  - Cotacoes recentes.
  - Simulacoes disponiveis.
  - Proxima acao sugerida.

#### `/app/calculadora`

Placeholder:

```text
Modulo Calculadora
Aqui sera implementada a nova cotacao com historico, imagens e economia via RPX.
```

#### `/app/simulacoes`

Placeholder:

```text
Modulo Simulacoes
Aqui o cliente vera simulacoes publicadas pelo time RPX.
```

### 4. Painel Administrativo RPX

Rotas:

```text
/admin
/admin/dashboard
/admin/clientes
/admin/fornecedores
/admin/despachantes
/admin/usuarios
/admin/parametros
/admin/cotacoes
/admin/simulacoes
```

Layout:

- Header com logo RPX.
- Sidebar administrativa.
- Conteudo central.
- Usuario logado.
- Botao de sair.

Menus iniciais:

- Dashboard.
- Clientes.
- Fornecedores.
- Despachantes.
- Usuarios.
- Parametros.
- Cotacoes.
- Simulacoes.

Conteudo placeholder por modulo:

#### `/admin/dashboard`

- Cards estaticos:
  - Clientes cadastrados.
  - Cotacoes recebidas.
  - Simulacoes em aberto.
  - Simulacoes publicadas.

#### `/admin/clientes`

- Titulo.
- Botao `Novo cliente`, inicialmente sem funcionalidade completa.
- Tabela placeholder.

#### `/admin/fornecedores`

- Titulo.
- Botao `Novo fornecedor`, inicialmente sem funcionalidade completa.
- Tabela placeholder.

#### `/admin/despachantes`

- Titulo.
- Botao `Novo despachante`, inicialmente sem funcionalidade completa.
- Tabela placeholder.

#### `/admin/usuarios`

- Titulo.
- Botao `Novo usuario`, inicialmente sem funcionalidade completa.
- Tabela placeholder.

#### `/admin/parametros`

- Titulo.
- Lista placeholder dos parametros futuros:
  - Fator RPX padrao.
  - Fator importacao direta padrao.
  - Maximo de imagens por cotacao.
  - Fonte do dolar.

#### `/admin/cotacoes`

- Titulo.
- Tabela placeholder.

#### `/admin/simulacoes`

- Titulo.
- Botao `Nova simulacao`, inicialmente sem funcionalidade completa.
- Tabela placeholder.

## Supabase

### Criar projeto

Criar um projeto Supabase para desenvolvimento/producao inicial.

Variaveis de ambiente esperadas:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

O `SUPABASE_SERVICE_ROLE_KEY` nao deve ser exposto no client.

### Tabelas minimas desta etapa

Nesta fundacao, criar apenas o necessario para autenticacao e roteamento por perfil.

#### app_users

```text
id uuid primary key
name text
email text
phone text
role text
status text
client_id uuid null
auth_provider text null
auth_provider_user_id text null
accepted_terms_at timestamptz null
created_at timestamptz
updated_at timestamptz
```

Roles iniciais:

```text
admin
client
```

#### clients

Pode ser criada ja nesta etapa, mesmo que com uso basico.

```text
id uuid primary key
company_name text
trade_name text
document text
contact_name text
contact_email text
contact_phone text
status text
created_at timestamptz
updated_at timestamptz
```

### RLS inicial

Ativar Row Level Security nas tabelas.

Regras desejadas:

- Usuario autenticado pode ler o proprio registro em `app_users`.
- Admin pode ler todos os usuarios da aplicacao.
- Cliente pode ler apenas o proprio client quando houver `client_id`.
- Admin pode ler todos os clients.

Nesta etapa, se a complexidade de RLS atrasar a validacao visual, priorizar:

1. Auth funcionando.
2. Usuario da aplicacao com role funcionando.
3. Protecao basica de rotas no Next.js.
4. RLS refinada logo na etapa seguinte.

## Criacao de usuarios iniciais

Criar pelo menos dois usuarios para teste:

### Admin RPX

```text
role: admin
destino apos login: /admin/dashboard
```

### Cliente teste

```text
role: client
destino apos login: /app
```

## Estrutura sugerida de pastas

```text
src/
  app/
    page.tsx
    login/
      page.tsx
    app/
      layout.tsx
      page.tsx
      calculadora/
        page.tsx
      simulacoes/
        page.tsx
    admin/
      layout.tsx
      page.tsx
      dashboard/
        page.tsx
      clientes/
        page.tsx
      fornecedores/
        page.tsx
      despachantes/
        page.tsx
      usuarios/
        page.tsx
      parametros/
        page.tsx
      cotacoes/
        page.tsx
      simulacoes/
        page.tsx
  components/
    layout/
      AppShell.tsx
      AdminShell.tsx
      Header.tsx
      Sidebar.tsx
    ui/
      Button.tsx
      Card.tsx
      TablePlaceholder.tsx
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    auth/
      get-session-profile.ts
      require-role.ts
  styles/
```

Se o projeto usar App Router do Next.js, manter essa estrutura com `src/app`.

## Middleware e protecao de rotas

Criar middleware para:

- Atualizar sessao do Supabase.
- Bloquear acesso a `/app/*` e `/admin/*` sem login.
- Impedir cliente de acessar `/admin/*`.
- Redirecionar admin que entra em `/app` para `/admin/dashboard`, se desejado.

Regras:

```text
Sem sessao + rota interna -> /login
Role client + /admin -> /app
Role admin + /admin -> permitido
Role client + /app -> permitido
```

## Identidade visual

Usar identidade visual RPX:

- Azul principal.
- Vermelho de destaque.
- Fundo claro.
- Layout profissional, limpo e objetivo.
- Mobile-first.

Assets:

- Logo RPX horizontal.

Se migrar do MVP atual, reaproveitar:

```text
public/logo-global-rpx-horizontal.png
```

## Deploy na Vercel

Passos esperados:

1. Criar projeto no GitHub ou conectar o repositorio existente.
2. Criar projeto na Vercel.
3. Configurar variaveis de ambiente do Supabase.
4. Fazer deploy.
5. Validar rotas publicas e privadas.

## Criterios de pronto

Esta etapa esta pronta quando:

- App Next.js roda localmente.
- App esta publicado na Vercel.
- Supabase Auth funciona.
- Usuario admin consegue entrar.
- Usuario cliente consegue entrar.
- Admin e redirecionado para painel admin.
- Cliente e redirecionado para area do cliente.
- Rotas internas bloqueiam usuario deslogado.
- Menu admin existe com todos os modulos planejados.
- Menu cliente existe com `Calculadora` e `Simulacoes`.
- Telas placeholder estao visualmente consistentes.
- Identidade visual RPX aplicada.

## Fora do escopo desta etapa

- Implementar calculadora completa.
- Salvar cotacoes.
- Upload de imagens.
- Historico real de cotacoes.
- Simulacoes reais.
- CRUD completo de clientes.
- CRUD completo de fornecedores.
- CRUD completo de despachantes.
- CRUD completo de usuarios.
- Relatorios.
- Dashboard real com metricas.
- Integracao com invoice.
- Emissao de nota.

## Proxima etapa apos a fundacao

Implementar o modulo de Calculadora:

- Nova cotacao.
- Historico de cotacoes.
- Upload de imagens.
- Parametros vindos do admin.
- Calculo de FOB total.
- Calculo via RPX.
- Calculo importacao direta.
- Totalizador de economia.
- Persistencia no Supabase.

Documento de referencia:

```text
docs/especificacao-calculadora.md
```

## Prompt sugerido para iniciar outro chat

```text
Quero iniciar a fundacao da plataforma Global RPX usando o arquivo docs/plano-fundacao-sistema.md como especificacao principal.

Objetivo: criar um app Next.js + TypeScript + Tailwind conectado ao Supabase, com deploy preparado para Vercel, contendo landing page, login, painel administrativo RPX e area do cliente.

Nesta etapa nao implemente a calculadora completa. Crie apenas a estrutura navegavel, autenticacao, protecao de rotas por role, layout base e telas placeholder dos modulos.

Use tambem docs/visao-geral-produto.md como contexto de produto.
```
