# Especificacao de CRUDs - Global RPX

Este documento define o padrao minimo para qualquer modulo CRUD administrativo da plataforma.

Objetivo:

- manter consistencia visual e funcional;
- evitar que cada modulo seja implementado de um jeito;
- permitir evolucao incremental com reuso de componentes.

## Escopo inicial

Aplica-se principalmente a modulos administrativos como:

- Clientes
- Usuarios
- Cotacoes
- Simulacoes
- Fornecedores
- Despachantes
- Parametros, quando houver listagens editaveis

## Estrutura minima da tela de listagem

Toda tela CRUD deve ter:

1. cabecalho com titulo, descricao curta e acao principal `Novo`;
2. acao de filtros no topo, ao lado de `Novo`;
3. tabela de listagem;
4. coluna `Acoes` por linha;
5. estados de vazio, erro e feedback de sucesso;
6. links de edicao no campo principal da linha.

Mensagens de feedback exibidas na pagina devem permitir fechamento manual pelo usuario com botao `X`.

## Filtros

Os filtros devem ficar acima da tabela e seguir este principio:

- priorizar filtros realmente usados na operacao;
- evitar excesso de campos na primeira versao;
- funcionar por query string para permitir refresh e compartilhamento de URL.
- o bloco visual de filtros deve nascer oculto e ser exibido por um botao/icone de filtro no topo;
- quando houver qualquer filtro ativo na URL, o painel de filtros deve abrir automaticamente e o botao deve indicar estado ativo.

Padrao minimo quando fizer sentido:

- nome
- empresa
- origem
- status
- periodo inicial
- periodo final

## Tabela

Regras obrigatorias:

- a rolagem horizontal deve existir dentro da tabela quando necessario;
- a pagina nao deve criar rolagem horizontal;
- a tabela deve respeitar `min-w-0` no layout ao redor;
- a coluna principal deve ser clicavel para abrir a edicao;
- a ultima coluna deve ser `Acoes`;
- em telas menores, a tabela pode rolar horizontalmente dentro do proprio container.

## Acoes por linha

Padrao inicial:

- `Editar`
- `Excluir`

`Excluir` nunca deve apagar fisicamente por padrao. Deve usar soft delete.

## Soft delete

Regra base:

- usar `deleted_at timestamptz null`;
- manter `status` coerente com o estado final, normalmente `inactive`;
- ocultar itens excluidos das listagens padrao;
- preservar historico e relacionamento.

Se houver usuario relacionado:

- desativar o usuario da aplicacao;
- bloquear acesso interno do usuario desativado.

## Modal de confirmacao

Toda exclusao deve abrir uma confirmacao explicita contendo:

- identificacao do registro;
- consequencia resumida;
- botao de cancelar;
- botao de confirmar exclusao.

Nao usar `window.confirm`.

## Formularios

Padrao:

- criar e editar em telas dedicadas;
- botao primario `Salvar`;
- botao secundario `Cancelar`;
- labels objetivas;
- ajuda curta quando houver ambiguidade;
- mensagens de erro e sucesso claras.
- alertas de erro e sucesso com opcao visivel de fechar.

## Modelagem de clientes

Para o modulo de clientes:

- `Responsavel/Nome` e obrigatorio;
- `Empresa` e opcional;
- a listagem deve sempre exibir a coluna `Empresa`;
- quando nao houver empresa, exibir `Pessoa fisica` ou `-`, conforme o contexto da tela.

Motivo:

- a base pode ter contatos corporativos e pessoas fisicas;
- nao devemos forcar nome de empresa inventado para cadastros individuais.

## Reuso esperado

Sempre que possivel, reutilizar:

- componente base de tabela;
- padrao de filtros;
- modal de confirmacao;
- formulario compartilhado do modulo;
- actions server-side com redirecionamento padronizado.

## Fora do escopo inicial

Nao sao obrigatorios na primeira versao de cada CRUD:

- ordenacao multi-coluna;
- exportacao;
- bulk actions;
- paginação sofisticada;
- auditoria completa de alteracoes;
- restauracao de registros excluidos.
