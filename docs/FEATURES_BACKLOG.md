# Global RPX - Backlog de Funcionalidades

Complexidade: **Baixa**, **Media** ou **Alta**.

## Concluido na estabilizacao

| Item | Descricao | Resultado |
|---|---|---|
| Ambiente executavel | Dependencias instaladas e lockfile gerado | Concluido em 2026-06-12 |
| Validacao estatica | Lint e typecheck executados sem erros finais | Concluido em 2026-06-12 |
| Build de producao | `next build` gerou 17 rotas | Concluido em 2026-06-12 |
| Tipagem Supabase SSR | Callbacks de cookies tipados com API oficial | Concluido em 2026-06-12 |

## MVP obrigatorio

| Item | Descricao | Prioridade | Complexidade | Dependencias |
|---|---|---:|---:|---|
| CI de qualidade | Automatizar `npm ci`, lint, typecheck e build | P0 | Media | Repositorio remoto |
| Supabase real | Projeto, envs, migrations e Auth | P0 | Media | Conta Supabase |
| Modelo de cotacoes | Criar tabelas e RLS de cotacoes/calculos | P0 | Alta | Modelo aprovado |
| Persistencia da calculadora | Substituir localStorage por Supabase | P0 | Alta | Cotacoes + Auth |
| Storage | Upload real de produto e cartao | P0 | Media | Bucket e policies |
| Historico do cliente | Lista e detalhe persistidos | P0 | Media | Cotacoes |
| Admin de cotacoes | Lista, detalhe e status Brasil | P0 | Alta | RLS admin |
| Parametros internos | Fatores e markup configuraveis | P0 | Media | `calculation_parameters` |
| PTAX resiliente | Timeout, erro controlado e snapshot da taxa | P0 | Media | API atual |
| Deploy Vercel | Preview e producao configurados | P0 | Baixa | Build e envs |
| Testes de isolamento | Garantir cliente1 != cliente2 | P0 | Media | RLS |
| Atualizacao segura do Next | Monitorar correcao do PostCSS sem downgrade incompatível | P1 | Baixa | Release compativel |

## Fase 2

| Item | Descricao | Prioridade | Complexidade | Dependencias |
|---|---|---:|---:|---|
| CRUD de clientes | Cadastro, status e contatos | P1 | Media | Auth admin |
| Gestao de usuarios | Convites e vinculo com cliente | P1 | Alta | Supabase Auth |
| Base de fornecedores | Cadastro e reaproveitamento | P1 | Media | Modelo suppliers |
| Produtos pesquisados | Reutilizar produto em cotacoes | P1 | Media | Products |
| Filtros de cotacoes | Produto, status, cliente e periodo | P1 | Baixa | Dados persistidos |
| Validacao de NCM | Status e comentario da equipe Brasil | P1 | Media | Admin cotacoes |
| Simulacoes admin | Criar analise vinculada a cotacao | P1 | Alta | Modelo simulations |
| Publicacao ao cliente | Exibir versao publicada | P1 | Media | Simulacoes |
| Notificacoes basicas | Avisar mudanca de status/publicacao | P1 | Media | E-mail provider |

## Fase 3

| Item | Descricao | Prioridade | Complexidade | Dependencias |
|---|---|---:|---:|---|
| Catalogo NCM no banco | Versoes e vigencia | P2 | Alta | Fonte oficial |
| Aliquotas e impostos | II, IPI, PIS, COFINS e ICMS | P2 | Alta | Validacao fiscal |
| Calculo detalhado | Custos logisticos e tributarios | P2 | Alta | Tax rules |
| OCR de cartoes | Extrair contatos multilingues | P2 | Alta | Storage/IA |
| OCR de invoice | Importar itens e valores | P2 | Alta | Storage/IA |
| Versionamento completo | Historico de simulacoes | P2 | Media | Simulation versions |
| Perfis internos | Comercial, operacional e fiscal | P2 | Alta | Novo RBAC |
| Auditoria | Log de alteracoes sensiveis | P2 | Media | Banco |

## Melhorias futuras

| Item | Descricao | Prioridade | Complexidade | Dependencias |
|---|---|---:|---:|---|
| PWA/offline | Captura de dados em feira com conexao instavel | P3 | Alta | UX mobile madura |
| Importacao em lote | Planilhas de produtos/cotacoes | P3 | Media | Modelo estabilizado |
| Dashboard analitico | Conversao, economia e pipeline | P3 | Media | Volume de dados |
| Integracao CRM | Sincronizar oportunidades | P3 | Alta | CRM definido |
| Integracao fiscal | Fontes oficiais/fornecedores tributarios | P3 | Alta | Contrato/API |
| Multiempresa | Mais de uma operacao/marca | P3 | Alta | Tenant model |
| Internacionalizacao | Portugues, ingles e mandarim | P3 | Alta | Conteudo e i18n |
