import Link from "next/link";
import { signUpAction } from "@/lib/actions/auth";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/Button";

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <Brand href="/" />
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-rpx-red">Cadastro gratuito</p>
          <h1 className="mt-2 text-3xl font-bold text-rpx-ink">Crie sua conta</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Acesse a calculadora e acompanhe suas cotacoes preliminares.
          </p>
        </div>
        {params.error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Nao foi possivel concluir o cadastro. Verifique os dados informados.
          </div>
        ) : null}
        <form action={signUpAction} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Nome
            <input
              required
              name="name"
              type="text"
              autoComplete="name"
              className="min-h-11 rounded-md border border-slate-300 px-3 outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            E-mail
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              className="min-h-11 rounded-md border border-slate-300 px-3 outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Celular
            <input
              required
              name="phone"
              type="tel"
              autoComplete="tel"
              className="min-h-11 rounded-md border border-slate-300 px-3 outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Senha
            <input
              required
              name="password"
              type="password"
              minLength={6}
              autoComplete="new-password"
              className="min-h-11 rounded-md border border-slate-300 px-3 outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
            />
          </label>
          <label className="flex items-start gap-3 text-sm leading-6 text-slate-700">
            <input
              required
              name="acceptedTerms"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-rpx-blue focus:ring-rpx-blue"
            />
            <span>
              Aceito os{" "}
              <Link
                href="/termos"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-rpx-blue hover:underline"
              >
                termos
              </Link>
            </span>
          </label>
          <Button type="submit" className="mt-2 w-full">
            Fazer cadastro
          </Button>
        </form>
        <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-rpx-blue hover:underline">
            Efetuar login
          </Link>
        </div>
      </section>
    </main>
  );
}
