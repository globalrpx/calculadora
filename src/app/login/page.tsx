import { signInAction } from "@/lib/actions/auth";
import { hasSupabaseConfig, mockUsers } from "@/lib/auth/mock-users";
import { Brand } from "@/components/layout/Brand";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; registered?: string; passwordReset?: string }>;
}) {
  const params = await searchParams;
  const showMockUsers = !hasSupabaseConfig();

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <Brand href="/" />
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-rpx-red">Acesso seguro</p>
          <h1 className="mt-2 text-3xl font-bold text-rpx-ink">Entrar na plataforma</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use o e-mail cadastrado para acessar sua área.
          </p>
        </div>
        {params.error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Não foi possível entrar. Verifique seus dados ou o perfil do usuário.
          </div>
        ) : null}
        {params.registered ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Cadastro concluído. Sua conta já pode ser usada para entrar na plataforma.
          </div>
        ) : null}
        {params.passwordReset === "success" ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Senha redefinida com sucesso. Acesse com sua nova senha.
          </div>
        ) : null}
        <form action={signInAction} className="mt-6 grid gap-4">
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
            <span className="flex items-center justify-between gap-3">
              Senha
              <Link href="/esqueci-senha" className="text-xs font-semibold text-rpx-blue hover:underline">
                Esqueci minha senha
              </Link>
            </span>
            <input
              required
              name="password"
              type="password"
              autoComplete="current-password"
              className="min-h-11 rounded-md border border-slate-300 px-3 outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
            />
          </label>
          <Button type="submit" className="mt-2 w-full">
            Entrar
          </Button>
        </form>
        <div className="mt-5 text-center text-sm text-slate-600">
          <Link href="/cadastro" className="font-semibold text-rpx-blue hover:underline">
            Faça seu cadastro
          </Link>
        </div>
        {showMockUsers ? (
          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Usuários mock para esta fase</p>
            <div className="mt-3 grid gap-2">
              {mockUsers.map((user) => (
                <form key={user.email} action={signInAction}>
                  <input type="hidden" name="email" value={user.email} />
                  <input type="hidden" name="password" value="mock" />
                  <button className="w-full rounded-md bg-white px-3 py-2 text-left text-sm font-semibold text-rpx-blue transition hover:bg-rpx-sky">
                    {user.email}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
