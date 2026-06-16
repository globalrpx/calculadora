# Global RPX - Estrutura de Pastas

## Visao resumida

```text
app-rpx/
├── data/
├── docs/
├── public/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── supabase/
├── middleware.ts
├── package.json
├── state.md
└── agents.md
```

## Pastas

### `src/app`

App Router do Next.js. Cada `page.tsx` representa uma rota; `layout.tsx` compartilha estrutura.

- `page.tsx`: pagina publica.
- `login/page.tsx`: login.
- `app/`: area protegida do cliente.
- `admin/`: area protegida administrativa.
- `api/exchange-rate/route.ts`: endpoint server-side da PTAX.
- `globals.css`: estilos globais e animacoes.

### `src/components`

Componentes React reutilizaveis.

- `calculator/CalculatorClient.tsx`: formulario, NCM, calculo, historico mock e detalhe.
- `layout/AppShell.tsx`: header, usuario, logout, sidebar e conteudo.
- `layout/Brand.tsx`: logo.
- `layout/PageHeader.tsx`: cabecalho de paginas internas.
- `ui/`: botoes, cards, tabelas, inputs e estados vazios.

### `src/lib`

Regras, auth e integracoes.

- `actions/auth.ts`: login/logout por Server Actions.
- `auth/`: usuarios mock, leitura da sessao e controle de role.
- `calculator/calculate-quote.ts`: formulas e formatacao.
- `exchange-rate/get-ptax.ts`: consulta server-side ao Banco Central.
- `supabase/`: clientes browser/server, configuracao e middleware.
- `types.ts`: tipos compartilhados de perfil e role.

### `supabase/migrations`

SQL versionado. Atualmente existe apenas `001_foundation.sql`, com `clients`, `profiles`, funcao `is_admin()` e RLS de leitura.

### `public`

Arquivos servidos diretamente:

- Logo horizontal.
- Imagem original convertida do PDF.
- `data/ncm.json`: base NCM normalizada para autocomplete.

### `data`

Dados-fonte que nao precisam ser servidos ao navegador:

- `ncm-oficial.json`: fonte completa usada na normalizacao.

### `scripts`

- `build-ncm-data.mjs`: gera o dataset enxuto de NCM.
- `preview-server.mjs`: preview temporario sem Next.js.

### `docs`

Especificacoes de produto e documentacao tecnica.

### Arquivos operacionais

- `state.md`: memoria viva do andamento.
- `agents.md`: regras para novas sessoes/agentes.
- `middleware.ts`: entrada do middleware Next.
- `.env.example`: variaveis esperadas.
- `vercel.json`: identifica o framework Next.js.

## Paginas existentes

Publicas:

- `/`
- `/login`

Cliente:

- `/app`
- `/app/calculadora`
- `/app/simulacoes`

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

API:

- `/api/exchange-rate`

## Pontos que precisam ser reorganizados

1. `CalculatorClient.tsx` tem mais de 500 linhas e concentra estado, validacao, autocomplete, uploads mock, calculo, persistencia, historico e detalhe.
2. `preview-server.mjs` duplica boa parte da interface e regras; toda mudanca exige manutencao em dois lugares.
3. Tipos de cotacao estao locais ao componente. Devem migrar para `src/lib/types` ou um dominio `src/features/quotes`.
4. Nomes de campos usam camelCase no front e snake_case no banco; criar mapeamento consistente.
5. Rotas de detalhe previstas nos documentos ainda nao existem.
6. Admin usa tabelas placeholder, sem camada de dados.
7. Nao ha camada de repositorio/queries para Supabase.
8. Nao ha testes automatizados.
9. Nao ha lockfile, CI ou migrations para os modulos funcionais.

## Estrutura recomendada para evolucao

```text
src/
├── app/
├── components/
│   ├── layout/
│   └── ui/
├── features/
│   ├── quotes/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── queries/
│   │   ├── schemas/
│   │   └── types.ts
│   ├── suppliers/
│   ├── simulations/
│   └── admin/
└── lib/
    ├── auth/
    ├── supabase/
    ├── exchange-rate/
    └── ncm/
```

Reorganizar apenas durante implementacoes reais, sem uma refatoracao massiva isolada.

