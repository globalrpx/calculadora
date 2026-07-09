import Link from "next/link";
import { Brand } from "@/components/layout/Brand";
import { ButtonLink } from "@/components/ui/Button";
import { ConfirmPasswordResetForm } from "@/components/auth/PasswordResetForms";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <Brand href="/" />
        <div className="mt-8">
          <p className="text-sm font-semibold uppercase text-rpx-red">Nova senha</p>
          <h1 className="mt-2 text-3xl font-bold text-rpx-ink">Redefinir senha</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Crie uma nova senha para acessar sua conta na plataforma.
          </p>
        </div>
        {!user ? (
          <div className="mt-6 grid gap-5">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              O link de redefinição expirou ou é inválido. Solicite um novo link.
            </div>
            <ButtonLink href="/esqueci-senha" className="w-full justify-center">
              Solicitar novo link
            </ButtonLink>
          </div>
        ) : (
          <ConfirmPasswordResetForm />
        )}
        <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-rpx-blue hover:underline">
            Voltar para o login
          </Link>
        </div>
      </section>
    </main>
  );
}
