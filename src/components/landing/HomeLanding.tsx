import { Brand } from "@/components/layout/Brand";
import { ButtonLink } from "@/components/ui/Button";

type Stat = {
  value: string;
  label: string;
};

type Problem = {
  title: string;
  description: string;
};

type Step = {
  title: string;
  description: string;
};

type Feature = {
  title: string;
  description: string;
};

type Audience = {
  title: string;
  description: string;
};

type Testimonial = {
  name: string;
  company: string;
  segment: string;
  quote: string;
  result: string;
};

type Faq = {
  question: string;
  answer: string;
};

const authorityStats: Stat[] = [
  { value: "+US$ 29 milhões", label: "em FOB gerados" },
  { value: "+250", label: "fornecedores conectados" },
  { value: "+2.400", label: "operações estruturadas" },
  { value: "Brasil + China", label: "equipe atuando nas duas pontas" }
];

const whatsappContactUrl =
  "https://api.whatsapp.com/send/?phone=5519998899164&text=D%C3%BAvidas%20sobre%20a%20calculadora%20da%20RPX";

const problems: Problem[] = [
  {
    title: "Comprar sem saber a margem real",
    description: "Uma cotação barata pode perder viabilidade quando os custos entram na conta."
  },
  {
    title: "Negociar um produto inviável",
    description: "Você ganha velocidade para descartar cenários ruins antes de investir energia na negociação."
  },
  {
    title: "Errar o preço de venda",
    description: "A estimativa inicial ajuda a enxergar se o produto ainda faz sentido no mercado brasileiro."
  },
  {
    title: "Descobrir custos importantes tarde demais",
    description: "Tributos, frete, seguro e despesas operacionais mudam completamente a leitura do negócio."
  }
];

const steps: Step[] = [
  {
    title: "Informe o produto",
    description: "Digite o nome do produto ou o código HS/NCM, caso já possua."
  },
  {
    title: "Preencha os valores",
    description: "Adicione preço em dólar, quantidade e outras informações disponíveis."
  },
  {
    title: "Veja a estimativa",
    description: "Receba uma visão inicial do custo total e do valor estimado por unidade."
  }
];

const resultItems = [
  "Valor total da mercadoria",
  "Câmbio utilizado",
  "NCM ou classificação fiscal sugerida",
  "Alíquotas estimadas",
  "Estimativa de impostos",
  "Custos de importação",
  "Custo total estimado",
  "Custo estimado por unidade"
];

const freeItems = [
  "Estimativa inicial do produto",
  "Sugestão de classificação fiscal",
  "Conversão cambial",
  "Impostos aproximados",
  "Custo estimado por unidade",
  "Histórico de simulações no painel do cliente"
];

const consultingItems = [
  "Validação técnica do NCM",
  "Avaliação da viabilidade econômica",
  "Cotação de frete",
  "Análise de fornecedores",
  "Custos aduaneiros e logísticos",
  "Estrutura recomendada para a operação",
  "Suporte de especialistas em importação"
];

const audiences: Audience[] = [
  {
    title: "Empresários que ainda não importam",
    description: "Para entender se um produto pode ter viabilidade no Brasil."
  },
  {
    title: "Empresas que compram de distribuidores",
    description: "Para comparar o custo atual com uma possível compra direta da fábrica."
  },
  {
    title: "Importadores em busca de novos produtos",
    description: "Para realizar avaliações iniciais com mais rapidez."
  },
  {
    title: "Participantes da Canton Fair",
    description: "Para simular produtos encontrados durante a feira e organizar oportunidades."
  }
];

const whyGlobalRpx: Feature[] = [
  {
    title: "Atuação ponta a ponta",
    description: "Da análise inicial à entrega da mercadoria."
  },
  {
    title: "Equipe no Brasil e na China",
    description: "Suporte para fornecedores, negociações, inspeções e operações locais."
  },
  {
    title: "Decisões baseadas em viabilidade",
    description: "A importação é analisada antes do investimento."
  },
  {
    title: "Experiência prática",
    description: "Operações estruturadas, fornecedores conectados e acompanhamento consultivo."
  }
];

const testimonials: Testimonial[] = [
  {
    name: "Nome do cliente",
    company: "Empresa",
    segment: "Segmento",
    quote:
      "A Global RPX nos ajudou a entender a operação antes de fechar com o fornecedor. Isso evitou decisões baseadas apenas no preço da mercadoria.",
    result: "Resultado ou aprendizado"
  },
  {
    name: "Nome do cliente",
    company: "Empresa",
    segment: "Segmento",
    quote:
      "Durante a avaliação dos produtos, conseguimos enxergar custos que não estavam claros na negociação inicial.",
    result: "Resultado ou aprendizado"
  },
  {
    name: "Nome do cliente",
    company: "Empresa",
    segment: "Segmento",
    quote:
      "O suporte da equipe trouxe mais segurança para transformar uma oportunidade em uma operação viável.",
    result: "Resultado ou aprendizado"
  }
];

const faqs: Faq[] = [
  {
    question: "A calculadora é gratuita?",
    answer:
      "Sim. A simulação inicial é gratuita e serve para ajudar você a avaliar a viabilidade de um produto antes de avançar."
  },
  {
    question: "O resultado é definitivo?",
    answer:
      "Não. O resultado é uma estimativa inicial. A classificação fiscal, os tributos, o frete e as despesas da operação precisam ser validados antes da importação."
  },
  {
    question: "Preciso saber o NCM do produto?",
    answer:
      "Não necessariamente. Você poderá informar o nome do produto. Quando houver dados suficientes, o sistema poderá sugerir uma classificação inicial para simulação."
  },
  {
    question: "A ferramenta calcula frete internacional?",
    answer:
      "Nesta primeira etapa, a calculadora pode trabalhar com estimativas ou campos manuais. Para uma análise completa, a Global RPX pode cotar e validar os custos logísticos."
  },
  {
    question: "Posso usar mesmo sem empresa?",
    answer:
      "Sim. Você pode fazer uma simulação inicial, mas uma operação formal de importação pode exigir estrutura empresarial e validações específicas."
  },
  {
    question: "A Global RPX pode validar minha simulação?",
    answer:
      "Sim. Após a simulação, você poderá solicitar uma análise detalhada com especialistas da Global RPX."
  }
];

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? <p className="text-sm font-semibold uppercase text-rpx-red">{eyebrow}</p> : null}
      <h2 className="mt-2 text-3xl font-bold text-rpx-ink sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-slate-600">{description}</p> : null}
    </div>
  );
}

function SectionBand({
  id,
  children,
  tone = "default"
}: {
  id?: string;
  children: React.ReactNode;
  tone?: "default" | "soft" | "white";
}) {
  const toneClass =
    tone === "soft" ? "bg-white/70" : tone === "white" ? "bg-white" : "bg-transparent";

  return (
    <section id={id} className={toneClass}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">{children}</div>
    </section>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
          <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rpx-sky text-xs font-bold text-rpx-blue">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CalculatorPreview() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-rpx-red">Preview da calculadora</p>
          <h3 className="mt-1 text-xl font-bold text-rpx-ink">Simulação inicial</h3>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Dólar do dia
        </span>
      </div>
      <div className="mt-5 grid gap-4">
        {[
          ["Produto", "Garrafa térmica inox"],
          ["Preço unitário", "US$ 4,80"],
          ["Quantidade", "1.000 unidades"],
          ["Câmbio", "PTAX ajustada para simulação"]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-rpx-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-lg border border-rpx-blue/15 bg-rpx-sky p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-rpx-blue">Resultado estimado</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-black text-rpx-navy">R$ 64,90</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">Custo estimado por unidade no Brasil</p>
          </div>
          <ButtonLink href="/cadastro" className="shrink-0">
            Simular agora
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function PlaceholderLink({
  children,
  href = "#",
  note = "TODO: definir rota ou canal final para este CTA.",
  rel,
  target
}: {
  children: React.ReactNode;
  href?: string;
  note?: string;
  rel?: string;
  target?: string;
}) {
  return (
    <a
      href={href}
      rel={rel}
      target={target}
      title={note}
      className="inline-flex min-h-11 items-center justify-center rounded-md border border-rpx-blue/20 bg-white px-4 py-2 text-sm font-semibold text-rpx-blue transition hover:bg-rpx-sky"
    >
      {children}
    </a>
  );
}

export function HomeLanding() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Brand href="/" />
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            <a href="#como-funciona" className="hover:text-rpx-blue">
              Como funciona
            </a>
            <a href="#o-que-calculamos" className="hover:text-rpx-blue">
              O que calculamos
            </a>
            <a href="#para-quem-e" className="hover:text-rpx-blue">
              Para quem é
            </a>
            <a href="#global-rpx" className="hover:text-rpx-blue">
              Global RPX
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <ButtonLink href="/login" variant="secondary" className="hidden sm:inline-flex">
              Entrar
            </ButtonLink>
            <ButtonLink href="/cadastro">Calcular grátis</ButtonLink>
          </div>
        </div>
      </header>

      <SectionBand tone="default">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rpx-red">
              Do preço na China ao custo no Brasil
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-rpx-navy sm:text-5xl lg:text-6xl">
              Antes de importar, descubra quanto o produto realmente pode custar
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Informe o produto, o preço em dólar e a quantidade. Receba uma estimativa inicial de
              impostos, custos de importação e valor por unidade.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Simulação inicial gratuita",
                "Cotação do dólar atualizada",
                "Impostos estimados por produto",
                "Resultado em poucos minutos"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-md border border-slate-200 bg-white px-4 py-3">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rpx-sky text-xs font-bold text-rpx-blue">
                    ✓
                  </span>
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/cadastro" className="sm:min-w-56">
                Calcular minha importação grátis
              </ButtonLink>
              <PlaceholderLink
                href={whatsappContactUrl}
                note="Abrir conversa no WhatsApp com a Global RPX."
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar com um especialista
              </PlaceholderLink>
            </div>
            <p className="mt-3 text-sm font-medium text-slate-500">Grátis para começar. Sem compromisso.</p>
            <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-500">
              Esta simulação possui caráter estimativo. A classificação fiscal, os tributos, o frete
              e as demais despesas devem ser validados antes da realização da operação.
            </p>
          </div>
          <CalculatorPreview />
        </div>
      </SectionBand>

      <SectionBand tone="white">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {authorityStats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-slate-200 p-5 shadow-soft">
              <p className="text-3xl font-black text-rpx-navy">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </SectionBand>

      <SectionBand tone="soft">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionHeading
            title="O preço do fornecedor não é o custo final da importação"
            description="Uma mercadoria anunciada por alguns dólares pode custar muito mais depois de impostos, frete, seguro, armazenagem, desembaraço e despesas operacionais."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {problems.map((problem) => (
              <div key={problem.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
                <h3 className="text-lg font-bold text-rpx-ink">{problem.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-8 max-w-3xl text-base leading-7 text-slate-600">
          A calculadora ajuda você a enxergar o cenário antes de avançar.
        </p>
      </SectionBand>

      <SectionBand id="como-funciona">
        <SectionHeading
          align="center"
          title="Faça sua primeira simulação em três passos"
          description="Uma entrada simples para avaliar o produto antes de aprofundar a operação."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rpx-sky text-sm font-black text-rpx-blue">
                {index + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold text-rpx-ink">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <ButtonLink href="/cadastro">Começar simulação gratuita</ButtonLink>
        </div>
      </SectionBand>

      <SectionBand id="o-que-calculamos" tone="white">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            title="Mais do que converter dólar para real"
            description="A calculadora organiza os principais componentes da importação para ajudar você a tomar uma decisão inicial com mais clareza."
          />
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <Checklist items={resultItems} />
            <p className="mt-6 text-sm leading-6 text-slate-500">
              O resultado não substitui uma análise fiscal e operacional completa. Ele serve como
              ponto de partida para avaliar viabilidade.
            </p>
          </div>
        </div>
      </SectionBand>

      <SectionBand tone="soft">
        <SectionHeading
          align="center"
          title="A estimativa ajuda você a começar. A análise completa ajuda você a decidir."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase text-rpx-red">Simulação gratuita</p>
            <h3 className="mt-2 text-2xl font-bold text-rpx-ink">Primeira visão da viabilidade</h3>
            <div className="mt-6">
              <Checklist items={freeItems} />
            </div>
            <div className="mt-6">
              <ButtonLink href="/cadastro">Fazer cálculo grátis</ButtonLink>
            </div>
          </div>
          <div className="rounded-lg border border-rpx-blue/20 bg-rpx-navy p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase text-rpx-red">Análise completa Global RPX</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Aprofundamento técnico e operacional</h3>
            <div className="mt-6">
              <ul className="grid gap-3">
                {consultingItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-100">
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <PlaceholderLink
                href={whatsappContactUrl}
                note="Abrir conversa no WhatsApp com a Global RPX."
                target="_blank"
                rel="noopener noreferrer"
              >
                Solicitar análise da operação
              </PlaceholderLink>
            </div>
          </div>
        </div>
      </SectionBand>

      <SectionBand id="para-quem-e">
        <SectionHeading
          align="center"
          title="Feita para quem quer avaliar uma importação antes de investir"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {audiences.map((audience) => (
            <div key={audience.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="text-lg font-bold text-rpx-ink">{audience.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{audience.description}</p>
            </div>
          ))}
        </div>
      </SectionBand>

      <SectionBand tone="white">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-rpx-red">Canton Fair</p>
              <h2 className="mt-2 text-3xl font-bold text-rpx-ink">
                Encontrou um produto na Canton Fair? Simule antes de avançar na negociação.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Registre produtos encontrados durante a feira, organize preços e quantidades e tenha
                uma primeira visão do possível custo de importação para o Brasil.
              </p>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Com o suporte da Global RPX, as oportunidades identificadas na feira podem avançar
                para validação de fornecedores, negociação e estruturação da operação.
              </p>
            </div>
            <div className="rounded-lg border border-rpx-blue/15 bg-rpx-sky p-6">
              <p className="text-sm leading-7 text-rpx-blue">
                Use a calculadora como triagem inicial e leve adiante apenas as oportunidades que
                realmente merecem uma análise mais profunda.
              </p>
              <div className="mt-6">
                <PlaceholderLink
                  href={whatsappContactUrl}
                  note="Abrir conversa no WhatsApp com a Global RPX."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Conhecer suporte para Canton Fair
                </PlaceholderLink>
              </div>
            </div>
          </div>
        </div>
      </SectionBand>

      <SectionBand id="global-rpx" tone="soft">
        <SectionHeading
          align="center"
          title="Tecnologia para a primeira análise. Experiência para toda a operação."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {whyGlobalRpx.map((item) => (
            <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="text-lg font-bold text-rpx-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </SectionBand>

      <SectionBand tone="white">
        <SectionHeading
          align="center"
          title="Empresários que transformaram oportunidades internacionais em operações reais"
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={`${testimonial.name}-${index}`} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
              {/* TODO: Substituir por depoimentos reais da Global RPX. */}
              <p className="text-sm font-semibold text-rpx-blue">
                {testimonial.name} • {testimonial.company}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{testimonial.segment}</p>
              <p className="mt-4 text-sm leading-7 text-slate-700">{testimonial.quote}</p>
              <p className="mt-4 text-sm font-medium text-slate-500">{testimonial.result}</p>
            </div>
          ))}
        </div>
      </SectionBand>

      <SectionBand tone="soft">
        <SectionHeading align="center" title="Dúvidas frequentes" />
        <div className="mt-10 grid gap-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <summary className="cursor-pointer list-none text-base font-bold text-rpx-ink">
                {faq.question}
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </SectionBand>

      <SectionBand tone="white">
        <div className="rounded-lg border border-slate-200 bg-rpx-navy p-8 text-white shadow-soft sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-rpx-red">Próximo passo</p>
              <h2 className="mt-2 text-3xl font-bold">Sua próxima importação começa com uma conta bem-feita</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                Faça uma simulação inicial gratuita e descubra se vale a pena avançar com o produto.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <ButtonLink href="/cadastro" variant="secondary" className="border-white bg-white text-rpx-blue hover:bg-rpx-sky">
                Calcular minha importação grátis
              </ButtonLink>
              <PlaceholderLink
                href={whatsappContactUrl}
                note="Abrir conversa no WhatsApp com a Global RPX."
                target="_blank"
                rel="noopener noreferrer"
              >
                Falar com um especialista
              </PlaceholderLink>
            </div>
          </div>
        </div>
      </SectionBand>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
          <div>
            <Brand href="/" />
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Ferramenta de simulação inicial de importação desenvolvida pela Global RPX.
            </p>
            <p className="mt-4 max-w-3xl text-xs leading-6 text-slate-500">
              As informações apresentadas pela calculadora são estimativas e não substituem análise
              fiscal, tributária, logística ou aduaneira profissional.
            </p>
          </div>
          <div className="grid gap-3 text-sm font-medium text-slate-600 sm:text-right">
            <a href="/privacidade">
              Política de Privacidade
            </a>
            <a href="/termos">Termos de Uso</a>
            <a
              href={whatsappContactUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contato
            </a>
            <a href="https://globalrpx.com" target="_blank" rel="noopener noreferrer">
              Global RPX
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
