# Global RPX - Guia de UI e UX

## Padrao visual atual

Identidade:

- Azul principal `#123f8c`.
- Azul escuro `#0b244f`.
- Vermelho `#d7282f`.
- Fundo claro `#f5f7fb`.
- Logo horizontal em `public/logo-global-rpx-horizontal.png`.

Caracteristicas:

- Bordas discretas.
- Raio de 6 a 8 px.
- Cards brancos.
- Tipografia Arial/Helvetica.
- Sidebar em desktop.
- Grade responsiva com Tailwind.
- Formularios simples e focados em operacao.
- CRUD de Clientes como referencia atual para listagens administrativas.

## Oportunidades de melhoria

- Continuar refinando navegacao e estados ativos conforme novos modulos.
- Padronizar loading/skeletons quando os fluxos ficarem mais complexos.
- Reduzir textos placeholder desatualizados.
- Melhorar acessibilidade de uploads e autocomplete NCM.
- Evitar tabelas largas como unica experiencia no celular.
- Adicionar confirmacoes e toasts para salvar/copiar.
- Substituir botoes sem acao por estados desabilitados ou fluxos reais.

## Componentes reutilizaveis recomendados

Existentes:

- `Button`, `ButtonLink`
- `Card`
- `ConfirmDialog`
- `DataTable`
- `DismissibleAlert`
- `EmptyState`
- `FormField`, `TextInput`, `NumberInput`
- `PageHeader`
- `AppShell`
- `StatusBadge`

A criar quando houver uso:

- `FileUpload` com preview, progresso e erro.
- `Autocomplete` generico.
- `StatCard` compacto.
- `FormError` e `FieldError`.
- `Toast`.
- `PageActions`.
- `FilterBar`.
- `Pagination`.
- `MobileList` para alternativa a tabela.
- `LoadingSkeleton`.
- `Timeline` para historico de status.

## Calculadora

Diretrizes:

- Manter o fluxo em duas etapas tipo sanfona.
- Exibir apenas campos que o cliente realmente conhece.
- Taxas, markup e fatores ficam ocultos.
- Quantidade padrao: 1000.
- Resultado em duas colunas no desktop e uma no celular.
- Numeros moderados, sem competir com os controles.
- Economia em destaque discreto e sempre como estimativa.
- Preservar dados ao clicar em `Refazer calculo`.
- Em erro de PTAX, manter formulario e explicar apenas que os parametros nao puderam ser atualizados.

## Experiencia em celular

- Uma coluna.
- Header compacto.
- Navegacao por menu ou barra inferior com poucos itens.
- Inputs com altura minima de 44 px.
- Upload com acesso a camera.
- CTA principal fixo ou facilmente alcancavel, sem cobrir conteudo.
- Historico em lista de itens, nao tabela horizontal.
- Valores longos devem quebrar ou reduzir dentro do bloco.
- Etapas curtas; informacoes secundarias em detalhes expansivos.

## Painel administrativo

- Interface densa e escaneavel.
- Em desktop, usar header fixo no topo e sidebar fixa a esquerda para aumentar a area util.
- No admin, agrupar a sidebar em secoes curtas: `Painel Administrativo`, `Back Office` e `Gerenciar`.
- O conteudo admin deve ocupar toda a largura restante com `w-full` e padding responsivo, sem centralizacao estreita.
- Tabelas com filtros persistentes.
- Rolagem horizontal deve ficar restrita ao container da tabela, nunca a pagina inteira.
- Status visiveis por badges.
- Acoes em menu por linha.
- Detalhe da cotacao com duas areas claras:
  - Dados enviados pelo cliente.
  - Validacao e notas internas.
- Parametros com historico, vigencia e autor.
- Nao usar cards decorativos para listas operacionais.
- Destacar pendencias e SLA, nao apenas totais.
- Em mobile, esconder a sidebar fixa e manter o menu/drawer atual.

## Area do cliente

- Linguagem simples, sem termos internos.
- Dashboard com proximas acoes reais.
- Historico por status e data.
- Simulacao publicada deve deixar claro:
  - O que foi validado.
  - O que continua estimado.
  - Data da atualizacao.
- Evitar expor regras comerciais, fatores ou notas internas.

## Acessibilidade

- Labels associados a todos os campos.
- Foco visivel.
- Contraste AA.
- Erros junto aos campos e resumo no topo.
- Botoes com texto ou icone acessivel.
- Autocomplete navegavel por teclado.
- Nao depender apenas de cor para status.
