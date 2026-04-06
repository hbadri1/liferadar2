#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIGHTSAIL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$LIGHTSAIL_DIR/.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$LIGHTSAIL_DIR/docker-compose.yml}"
NGINX_TEMPLATE="${NGINX_TEMPLATE:-$LIGHTSAIL_DIR/nginx/default.conf.template}"
SSH_KEY_PATH="${SSH_KEY_PATH:-$LIGHTSAIL_DIR/liferadar-lightsail01.pem}"
SSH_USER="${SSH_USER:-ec2-user}"
SSH_PORT="${SSH_PORT:-22}"
REMOTE_DIR="${REMOTE_DIR:-/opt/liferadar}"

require_command() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: required command not found: $cmd" >&2
    exit 1
  }
}

require_file() {
  local file_path="$1"
  [[ -f "$file_path" ]] || {
    echo "ERROR: missing required file: $file_path" >&2
    exit 1
  }
}

trim() {
  local value="$1"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

load_env_file() {
  require_file "$ENV_FILE"

  while IFS= read -r line || [[ -n "$line" ]]; do
    line="$(trim "$line")"
    [[ -z "$line" || "$line" == \#* ]] && continue
    [[ "$line" == *=* ]] || continue

    local key="${line%%=*}"
    local val="${line#*=}"

    key="$(trim "$key")"
    val="$(trim "$val")"

    if [[ "${val:0:1}" == '"' && "${val: -1}" == '"' ]]; then
      val="${val:1:${#val}-2}"
    elif [[ "${val:0:1}" == "'" && "${val: -1}" == "'" ]]; then
      val="${val:1:${#val}-2}"
    fi

    export "$key=$val"
  done < "$ENV_FILE"
}

require_env() {
  local var_name="$1"
  [[ -n "${!var_name:-}" ]] || {
    echo "ERROR: $var_name must be set in $ENV_FILE" >&2
    exit 1
  }
}

apply_aws_env_auth() {
  if [[ -n "${AWS_PROFILE:-}" ]]; then
    export AWS_PROFILE
  fi

  if [[ -n "${AWS_ACCESS_KEY_ID:-}" ]]; then
    export AWS_ACCESS_KEY_ID
  fi

  if [[ -n "${AWS_SECRET_ACCESS_KEY:-}" ]]; then
    export AWS_SECRET_ACCESS_KEY
  fi

  if [[ -n "${AWS_SESSION_TOKEN:-}" ]]; then
    export AWS_SESSION_TOKEN
  fi
}

resolve_project_root() {
  if git -C "$SCRIPT_DIR" rev-parse --show-toplevel >/dev/null 2>&1; then
    git -C "$SCRIPT_DIR" rev-parse --show-toplevel
    return
  fi

  # Fallback if script is copied outside a git checkout.
  cd "$SCRIPT_DIR/../../../../../../../.." && pwd
}

ssh_opts() {
  printf '%s\n' -o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new -i "$SSH_KEY_PATH" -p "$SSH_PORT"
}

scp_opts() {
  printf '%s\n' -o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=accept-new -i "$SSH_KEY_PATH" -P "$SSH_PORT"
}

