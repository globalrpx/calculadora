# Global RPX - Status Atual

Data do diagnostico: 12 de junho de 2026.

## O que esta pronto

- Fundacao Next.js 15, React 19, TypeScript e Tailwind.
- Home e login.
- Layouts separados para cliente e admin.
- Middleware e verificacao de role.
- Modo mock por cookie com dois clientes e um admin.
- Estrutura de Supabase SSR.
- Migration inicial de `clients` e `profiles`.
- Calculadora funcional no front.
- Validacao de produto e fornecedor.
- NCM autocomplete com dataset oficial normalizado.
- PTAX server-side em tempo de execucao.
- Parametros internos ocultos do cliente.
- Historico mock isolado por e-mail em localStorage.
- Preview local temporario na porta 3002.
- Logo e identidade visual basica.
- Dependencias instaladas e `package-lock.json` gerado.
- Lint, typecheck e build de producao aprovados em 12 de junho de 2026.

## O que esta incompleto

- Supabase real nao configurado.
- Cotacoes nao persistem no banco.
- Uploads sao apenas nomes de arquivos no mock.
- Admin e quase todo placeholder.
- Simulacoes nao existem funcionalmente.
- NCM nao possui validacao administrativa.
- Impostos e aliquotas nao foram implementados.
- Deploy Vercel nao foi realizado.
- Nao existem testes automatizados.
- O comando `next lint` funciona no Next 15, mas esta depreciado para o Next 16.
- `npm audit` registra duas vulnerabilidades moderadas no PostCSS interno do Next.

## O que precisa ser refatorado

### `CalculatorClient.tsx`

Concentra:

- Formulario.
- Validacao.
- Busca NCM.
- Calculo.
- Chamada PTAX.
- Upload mock.
- Persistencia local.
- Historico.
- Detalhe e copia.

Separar gradualmente em componentes e actions do dominio de cotacoes.

### `preview-server.mjs`

Duplica a aplicacao. Deve ser removido quando o Next real estiver executavel e publicado.

### Tipos e dados

- `QuoteRecord` esta dentro do componente.
- Nao ha schemas de validacao compartilhados.
- Nao ha camada de queries/repositories.
- Parametros estao hardcoded.

## Riscos tecnicos

1. Alteracoes futuras ainda podem criar divergencia entre o preview e o Next; o build atual esta aprovado.
2. Duplicacao entre preview e aplicacao aumenta divergencia.
3. localStorage nao e persistencia confiavel nem seguro para dados do negocio.
4. Migration atual nao suporta calculadora, imagens ou simulacoes.
5. RLS ainda nao foi testada em ambiente Supabase.
6. PTAX sem timeout explicito pode atrasar o calculo.
7. Parametros comerciais hardcoded dificultam auditoria.
8. O audit possui duas vulnerabilidades moderadas sem correcao compativel sugerida pelo npm.
9. Nao ha testes de formulas, permissoes ou fluxo.
10. O ambiente local ainda nao possui npm convencional no PATH.

## Validacao tecnica de 12 de junho de 2026

Comandos executados:

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run start -- -p 3003
npm ls --depth=0
npm audit --json
```

Resultados:

- Instalacao: sucesso, 424 pacotes.
- Lockfile: `package-lock.json` v3 criado.
- Lint: sucesso, sem erros ou warnings de codigo.
- Typecheck inicial: falhou por tipos implicitos nos cookies do Supabase.
- Correcao: callbacks tipados com `SetAllCookies` do `@supabase/ssr`.
- Typecheck final: sucesso.
- Build inicial: falhou pelo mesmo erro de tipos.
- Build final: sucesso, 17 rotas geradas.
- Servidor de producao: iniciou e respondeu corretamente em `/`, `/login`, `/app` e `/api/exchange-rate`.
- Audit: 2 vulnerabilidades moderadas, 0 altas e 0 criticas.

Relatorio completo: `docs/BUILD_REPORT.md`.

## Proximos 10 passos

1. Definir Node 20 ou 22 LTS como versao padrao do projeto/Vercel.
2. Criar CI com `npm ci`, lint, typecheck e build.
3. Criar projeto Supabase de desenvolvimento e configurar envs.
4. Criar migrations de cotacoes, calculos, anexos, parametros e historico.
5. Implementar e testar RLS com admin, cliente1 e cliente2.
6. Migrar a calculadora de localStorage para Server Action + Supabase.
7. Implementar bucket privado e upload real de imagens.
8. Criar historico/detalhe persistidos na area do cliente.
9. Criar lista/detalhe de cotacoes no admin e fluxo de validacao Brasil.
10. Publicar preview na Vercel e apos validacao remover o preview Node.

## Diagnostico final

A fundacao e coerente para um MVP e a escolha de Next.js e adequada para Vercel + Supabase. O principal trabalho agora nao e redesenhar a interface: e transformar a demonstracao funcional em uma aplicacao persistente, segura e testada, reduzindo a duplicacao do preview.
