# Global RPX - Status Atual

Data do resumo executivo: 9 de julho de 2026.

Este documento e um resumo executivo de alto nivel do estado atual. Para a memoria viva, historico granular de entregas, validacoes e proximas acoes detalhadas, consulte `state.md`.

Regra operacional:

- `state.md` deve ser atualizado ao final de toda entrega relevante.
- `docs/CURRENT_STATUS.md` nao precisa ser atualizado em toda entrega pequena ou incremental.
- Atualize este documento quando houver mudanca de fase, marco importante, conclusao de modulo relevante, mudanca de arquitetura/modelo de dados, deploy significativo ou revisao documental ampla.
- Em caso de divergencia, `state.md` prevalece como fonte mais recente.

## Fase Atual

Fundacao autenticada com Supabase real, calculadora persistida e primeira base dinamica do painel administrativo.

## Pronto ou Funcional

- Projeto Next.js 15 com App Router, React 19, TypeScript e Tailwind.
- Supabase Auth real funcionando quando as variaveis de ambiente estao configuradas.
- `app_users` como fonte de verdade da aplicacao para usuario, role, status e vinculo com cliente.
- Middleware e layouts protegendo rotas de cliente e admin.
- Home publica, cadastro publico, login, conta, area do cliente e area administrativa.
- Calculadora funcional com NCM local, PTAX server-side, fatores internos ocultos e aviso de estimativa.
- Cotacoes da calculadora persistidas em `quotes`.
- Historico da calculadora carregando dados reais do Supabase.
- Solicitacao de simulacao completa criando registros em `simulations` e evitando duplicidade pendente por cotacao.
- Dashboard do cliente com dados reais.
- Dashboard administrativo com contadores dinamicos.
- Admin de Clientes com CRUD completo: listagem, filtros, paginacao, ordenacao, status badge, criacao, edicao, validacao inline server-side, e-mail duplicado no campo correto e inativacao/soft delete com confirmacao.
- Admin de Cotacoes, Usuarios e Simulacoes com base dinamica inicial.
- Supabase Storage administrativo iniciado com bucket privado `app-uploads`, tabela unica `uploads` e upload real de multiplos arquivos no detalhe de simulacao.
- Preview temporario e modo mock ainda disponiveis como fallback/apoio, nao como fluxo principal.

## Parcial ou Pendente

- CRUDs administrativos de Cotacoes, Usuarios e Simulacoes ainda precisam ser refinados no mesmo padrao de Clientes.
- Imagens da calculadora ainda precisam ser migradas para Storage/metadados; hoje o Storage real foi consolidado primeiro para anexos administrativos de simulacao.
- Parametros administrativos versionados para fatores e markup cambial ainda precisam sair do padrao inicial/hardcoded.
- Simulacoes ainda precisam de editor administrativo completo, publicacao refinada e detalhe do cliente.
- Validacao fiscal/NCM, impostos e aliquotas permanecem fora do escopo atual.
- Testes automatizados e CI ainda nao foram implementados.
- Validacao completa de RLS entre multiplos clientes ainda e uma etapa recomendada antes de producao.

## Riscos e Cuidados

- Nao usar `profiles` como fonte principal; novas implementacoes devem usar `app_users`.
- Nao expor `SUPABASE_SERVICE_ROLE_KEY` em Client Components.
- Nao expor PTAX, markup cambial ou fatores internos ao cliente.
- Nao tratar economia como garantia comercial.
- Nao usar o preview/mock como referencia principal quando o app Next/Supabase real estiver disponivel.
- Migrations ja aplicadas nao devem ser editadas; criar migrations incrementais.

## Proximas Etapas Recomendadas

1. Refinar CRUDs de Cotacoes, Usuarios e Simulacoes seguindo `docs/spec-cruds.md`.
2. Migrar imagens da calculadora/cotacoes para a tabela `uploads` ou estrutura equivalente com policies por `client_id`.
3. Criar parametros administrativos versionados para fatores e markup.
4. Validar RLS com admin e pelo menos dois clientes.
5. Criar CI para `npm ci`, lint, typecheck e build.
6. Revisar deploy/preview na Vercel quando a rodada de ajustes estiver estabilizada.
