"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { requestPasswordReset, confirmPasswordReset } from "@/lib/actions/password-reset";
import { Button } from "@/components/ui/Button";

function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="mt-2 w-full" disabled={pending}>
      {pending ? "Enviando..." : children}
    </Button>
  );
}

export function RequestPasswordResetForm() {
  const [state, formAction] = useActionState(requestPasswordReset, {});

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      {state.message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.message}
        </div>
      ) : null}
      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        E-mail
        <input
          required
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email ?? ""}
          className="min-h-11 rounded-md border border-slate-300 px-3 outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
        />
      </label>
      <SubmitButton>Enviar link de redefinição</SubmitButton>
    </form>
  );
}

export function ConfirmPasswordResetForm() {
  const [state, formAction] = useActionState(confirmPasswordReset, {});

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Nova senha
        <input
          required
          name="password"
          type="password"
          minLength={8}
          autoComplete="new-password"
          className="min-h-11 rounded-md border border-slate-300 px-3 outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Confirmar nova senha
        <input
          required
          name="confirmPassword"
          type="password"
          minLength={8}
          autoComplete="new-password"
          className="min-h-11 rounded-md border border-slate-300 px-3 outline-none transition focus:border-rpx-blue focus:ring-4 focus:ring-rpx-blue/10"
        />
      </label>
      <SubmitButton>Redefinir senha</SubmitButton>
    </form>
  );
}
