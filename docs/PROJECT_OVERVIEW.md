# Global RPX - Visao Geral do Projeto

## Nota sobre a arquitetura atual

O repositorio atual nao usa Vite. Ele usa **Next.js 15 com App Router**, React 19, TypeScript e Tailwind CSS. Next.js deve ser mantido, pois ja oferece rotas, componentes de servidor, middleware, endpoints HTTP e integracao direta com a Vercel.

## Objetivo

A Global RPX e uma plataforma web para centralizar cotacoes preliminares de importacao, dados de produtos e fornecedores, simulacoes preparadas pela equipe brasileira e o relacionamento operacional com clientes.

O primeiro modulo funcional e uma calculadora que compara uma referencia de importacao direta com uma estimativa de compra via RPX. O produto deve evoluir de forma incremental, sem nascer como um ERP completo.

## Publico-alvo

- Clientes da Global RPX pesquisando produtos e avaliando viabilidade de importacao.
- Equipe administrativa, comercial e operacional da RPX no Brasil.
- Futuramente, analistas fiscais, despachantes e outros colaboradores internos com permissoes especificas.

## Problema resolvido

Hoje, informacoes de feira, fornecedores, cartoes de visita, fotos, produtos e calculos podem ficar espalhadas em cadernos, planilhas e conversas. A plataforma busca:

- Registrar produtos e contatos no momento da pesquisa.
- Padronizar estimativas preliminares.
- Preservar historico por cliente.
- Dar visibilidade para a equipe RPX validar oportunidades.
- Apresentar custo e diferenca estimada de forma simples.
- Criar uma base organizada para simulacoes mais completas.

## Modulos planejados

1. Site publico e login.
2. Area do cliente.
3. Calculadora de cotacao preliminar.
4. Historico e detalhe de cotacoes.
5. Simulacoes validadas pela equipe RPX.
6. Painel administrativo.
7. Clientes, usuarios e permissoes.
8. Fornecedores e contatos.
9. Parametros de calculo.
10. NCM, aliquotas e validacao fiscal.
11. Anexos e imagens.
12. Integracoes externas, OCR e relatorios.

## Fluxo geral do cliente

1. O cliente entra pela rota `/login`.
2. A sessao e validada e o cliente e enviado para `/app`.
3. Em `/app/calculadora`, informa produto, NCM/HS sugerido, FOB, quantidade e fornecedor.
4. O fornecedor e identificado por dados completos ou foto do cartao/contato.
5. Ao clicar em `Fazer calculo`, o servidor consulta a PTAX venda mais recente.
6. O sistema aplica parametros internos e apresenta a estimativa.
7. O cliente pode refazer ou salvar a cotacao.
8. A cotacao salva aparece no historico do proprio cliente.
9. Futuramente, o cliente acompanha a validacao e simulacoes publicadas pela equipe RPX.

## Fluxo geral do administrador

1. O administrador entra pela mesma tela de login.
2. O perfil `admin` e direcionado para `/admin/dashboard`.
3. Visualiza cotacoes recebidas de todos os clientes.
4. Confere produto, fornecedor, anexos, NCM e valores.
5. Ajusta ou valida classificacao fiscal e parametros.
6. Altera o status da cotacao.
7. Cria uma simulacao detalhada vinculada a cotacao.
8. Publica o resultado para o cliente.
9. Gerencia clientes, usuarios, fornecedores e parametros globais.

## Principios do produto

- Interfaces objetivas e adequadas ao uso em celular.
- Dados de clientes isolados por `client_id`.
- Parametros comerciais internos nunca expostos ao cliente.
- Economia sempre apresentada como estimativa, nunca garantia.
- NCM sugerido sempre sujeito a validacao fiscal.
- Evolucao por fases, preservando historico e rastreabilidade.

