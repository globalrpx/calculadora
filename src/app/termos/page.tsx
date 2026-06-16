import { Brand } from "@/components/layout/Brand";
import { ButtonLink } from "@/components/ui/Button";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <Brand href="/" />
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-rpx-red">Termos de uso</p>
          <h1 className="mt-2 text-3xl font-bold text-rpx-ink">Termos da Plataforma Global RPX</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Estes termos regulam o uso inicial da plataforma para cadastro, cálculos preliminares,
            cotações e acesso a simulações disponibilizadas pela Global RPX.
          </p>
        </div>
        <div className="mt-8 grid gap-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-rpx-navy">Uso da plataforma</h2>
            <p className="mt-2">
              O usuário deve informar dados verdadeiros e manter suas credenciais em segurança. O
              acesso pode ser revisado pela Global RPX quando houver uso indevido ou necessidade
              operacional.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-rpx-navy">Estimativas e cotações</h2>
            <p className="mt-2">
              Os cálculos exibidos são preliminares e não substituem análise fiscal, logística ou
              operacional. Valores, classificações e condições podem mudar após validação pela equipe
              RPX.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-rpx-navy">Dados informados</h2>
            <p className="mt-2">
              Dados de contato, produto, fornecedor e anexos enviados podem ser usados pela Global
              RPX para atendimento, análise de viabilidade e preparação de simulações relacionadas.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-rpx-navy">Atualizações</h2>
            <p className="mt-2">
              Estes termos podem ser atualizados conforme a plataforma evoluir. Novos recursos podem
              ter condições específicas apresentadas no momento de uso.
            </p>
          </section>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/" variant="secondary">
            Voltar para a home
          </ButtonLink>
          <ButtonLink href="/cadastro">Voltar ao cadastro</ButtonLink>
          <ButtonLink href="/login" variant="secondary">
            Efetuar login
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
