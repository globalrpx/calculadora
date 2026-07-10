#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env.supabase.dev"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Arquivo .env.supabase.dev nao encontrado." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "SUPABASE_PROJECT_REF nao configurado em .env.supabase.dev." >&2
  exit 1
fi

cd "$ROOT_DIR"
SUPABASE_TELEMETRY_DISABLED=1 supabase link --project-ref "$SUPABASE_PROJECT_REF"
