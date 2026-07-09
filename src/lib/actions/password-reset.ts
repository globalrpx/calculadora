"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PasswordResetRequestState = {
  message?: string;
  error?: string;
  values?: {
    email?: string;
  };
};

type ConfirmPasswordResetState = {
  error?: string;
};

const neutralResetMessage = "Se esse e-mail estiver cadastrado, enviaremos um link para redefinição de senha.";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeSiteUrl(value?: string | null) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

async function getSiteUrl() {
  const configuredUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

  if (configuredUrl) {
    return configuredUrl;
  }

  const vercelUrl = normalizeSiteUrl(process.env.VERCEL_URL);

  if (vercelUrl) {
    return vercelUrl;
  }

  const headerStore = await headers();
  const origin = normalizeSiteUrl(headerStore.get("origin"));

  return origin || "http://localhost:3000";
}

export async function requestPasswordReset(
  _previousState: PasswordResetRequestState,
  formData: FormData
): Promise<PasswordResetRequestState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return {
      error: "Informe um e-mail válido.",
      values: { email }
    };
  }

  try {
    const supabase = await createClient();
    const siteUrl = await getSiteUrl();
    const redirectTo = `${siteUrl}/auth/callback?next=/redefinir-senha`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) {
      console.error("Password reset request failed:", error.message);
    }
  } catch (error) {
    console.error("Password reset request failed:", error);
  }

  return {
    message: neutralResetMessage,
    values: { email: "" }
  };
}

export async function confirmPasswordReset(
  _previousState: ConfirmPasswordResetState,
  formData: FormData
): Promise<ConfirmPasswordResetState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return {
      error: "A nova senha precisa ter pelo menos 8 caracteres."
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "A confirmação precisa ser igual à nova senha."
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "O link de redefinição expirou ou é inválido. Solicite um novo link."
    };
  }

  const { data: appUser } = await supabase
    .from("app_users")
    .select("id")
    .eq("auth_provider", "supabase")
    .eq("auth_provider_user_id", user.id)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (!appUser) {
    await supabase.auth.signOut();

    return {
      error: "Sua conta não está ativa. Entre em contato com a Global RPX."
    };
  }

  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    return {
      error: "Não foi possível redefinir sua senha. Solicite um novo link e tente novamente."
    };
  }

  await supabase.auth.signOut();
  redirect("/login?passwordReset=success");
}
