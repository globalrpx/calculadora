import Link from "next/link";
import { Brand } from "@/components/layout/Brand";
import { RequestPasswordResetForm } from "@/components/auth/PasswordResetForms";

export default async function ForgotPasswordPage({
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
          <p className="text-sm font-semibold uppercase text-rpx-red">Recuperação de acesso</p>
          <h1 className="mt-2 text-3xl font-bold text-rpx-ink">Esqueci minha senha</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Informe seu e-mail para receber um link seguro de redefinição.
          </p>
        </div>
        {params.error === "invalid_link" ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            O link de redefinição expirou ou é inválido. Solicite um novo link.
          </div>
        ) : null}
        <RequestPasswordResetForm />
        <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-rpx-blue hover:underline">
            Voltar para o login
          </Link>
        </div>
      </section>
    </main>
  );
}
