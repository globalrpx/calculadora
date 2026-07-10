#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROD_ENV_FILE="$ROOT_DIR/.env.supabase.prod"
DEV_ENV_FILE="$ROOT_DIR/.env.supabase.dev"

relink_dev() {
  if [[ -f "$DEV_ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$DEV_ENV_FILE"
    set +a

    if [[ -n "${SUPABASE_PROJECT_REF:-}" ]]; then
      echo "Voltando link do Supabase CLI para DEV..."
      SUPABASE_TELEMETRY_DISABLED=1 supabase link --project-ref "$SUPABASE_PROJECT_REF" || true
    fi
  fi
}

trap relink_dev EXIT

if [[ "${CONFIRM_PROD_DB_PUSH:-}" != "YES" ]]; then
  echo "Abortado: para push em PRODUCAO, rode com CONFIRM_PROD_DB_PUSH=YES." >&2
  exit 1
fi

if [[ ! -f "$PROD_ENV_FILE" ]]; then
  echo "Arquivo .env.supabase.prod nao encontrado." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$PROD_ENV_FILE"
set +a

if [[ -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "SUPABASE_PROJECT_REF nao configurado em .env.supabase.prod." >&2
  exit 1
fi

echo "ATENCAO: aplicando migrations em PRODUCAO."
echo "Project ref: $SUPABASE_PROJECT_REF"

cd "$ROOT_DIR"
SUPABASE_TELEMETRY_DISABLED=1 supabase link --project-ref "$SUPABASE_PROJECT_REF"
SUPABASE_TELEMETRY_DISABLED=1 supabase db push --linked
