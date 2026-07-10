#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.supabase.prod"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Arquivo .env.supabase.prod nao encontrado." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "SUPABASE_PROJECT_REF nao configurado em .env.supabase.prod." >&2
  exit 1
fi

echo "ATENCAO: linkando o Supabase CLI ao ambiente de PRODUCAO."
echo "Project ref: $SUPABASE_PROJECT_REF"

cd "$ROOT_DIR"
SUPABASE_TELEMETRY_DISABLED=1 supabase link --project-ref "$SUPABASE_PROJECT_REF"
