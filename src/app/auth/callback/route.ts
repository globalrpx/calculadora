import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/redefinir-senha";
  }

  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (!code && !tokenHash) {
    return NextResponse.redirect(new URL("/login?error=auth-callback", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } =
    tokenHash && type === "recovery"
      ? await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery"
        })
      : await supabase.auth.exchangeCodeForSession(code ?? "");

  if (error) {
    console.error("Auth callback failed:", error.message);
    return NextResponse.redirect(new URL("/esqueci-senha?error=invalid_link", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
