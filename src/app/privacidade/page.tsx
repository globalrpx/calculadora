import { Brand } from "@/components/layout/Brand";
import { ButtonLink } from "@/components/ui/Button";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <Brand href="/" />
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-rpx-red">Política de Privacidade</p>
          <h1 className="mt-2 text-3xl font-bold text-rpx-ink">Privacidade e uso de dados na Global RPX</h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Esta página apresenta, de forma geral, como os dados informados no sistema podem ser
            utilizados pela Global RPX no contexto de cadastro, simulações e atendimento comercial
            relacionado à plataforma.
          </p>
        </div>
        <div className="mt-8 grid gap-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-rpx-navy">Dados coletados</h2>
            <p className="mt-2">
              Podemos coletar dados de identificação e contato, informações sobre produtos,
              fornecedores, arquivos enviados e dados preenchidos nos formulários da plataforma.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-rpx-navy">Finalidade de uso</h2>
            <p className="mt-2">
              Essas informações podem ser utilizadas para permitir o acesso ao sistema, registrar
              simulações, organizar o histórico do cliente, prestar suporte, avaliar a viabilidade de
              operações e dar andamento ao relacionamento comercial com a Global RPX.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-rpx-navy">Compartilhamento e proteção</h2>
            <p className="mt-2">
              A Global RPX busca adotar medidas razoáveis de segurança para proteger os dados
              informados no sistema. Eventuais compartilhamentos devem ocorrer apenas quando
              necessários para a operação, atendimento, cumprimento de obrigações legais ou evolução
              dos serviços prestados.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-rpx-navy">Atualizações desta política</h2>
            <p className="mt-2">
              Esta política pode ser ajustada ao longo da evolução da plataforma. Quando isso
              acontecer, a versão publicada nesta página passará a refletir as diretrizes vigentes.
            </p>
          </section>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">Voltar para a home</ButtonLink>
          <ButtonLink href="/termos" variant="secondary">
            Ver termos de uso
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
