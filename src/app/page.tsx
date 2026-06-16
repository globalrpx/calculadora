import { ButtonLink } from "@/components/ui/Button";
import { Brand } from "@/components/layout/Brand";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Brand />
        <ButtonLink href="/login" variant="secondary">
          Entrar
        </ButtonLink>
      </header>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div>
          <p className="text-sm font-bold uppercase text-rpx-red">Plataforma Global RPX</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-rpx-navy sm:text-5xl">
            Cotacoes preliminares e simulacoes de importacao em um unico ambiente.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Centralize relacionamento com clientes, organize simulacoes internas e prepare a operacao para evoluir com dados, parametros e historico.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/login">Entrar na plataforma</ButtonLink>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="grid gap-4">
            {[
              ["Clientes", "Area autenticada para cotacoes e simulacoes publicadas."],
              ["RPX Admin", "Painel interno para cadastros, parametros e acompanhamento."],
              ["Proxima etapa", "Calculadora com historico, imagens e economia estimada."]
            ].map(([title, text]) => (
              <div key={title} className="rounded-md border border-slate-200 p-4">
                <h2 className="font-bold text-rpx-blue">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
