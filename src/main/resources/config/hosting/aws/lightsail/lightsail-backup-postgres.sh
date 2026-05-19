#!/bin/bash
set -euo pipefail

# This script is intended to run on the Lightsail host.
# It creates a timestamped PostgreSQL dump from the running DB container.
CONTAINER_NAME=${1:-liferadar-db}
BACKUP_DIR=${BACKUP_DIR:-"$HOME/liferadar-backups"}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/postgres_${TIMESTAMP}.sql.gz"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is not installed on this host." >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
  echo "ERROR: container '${CONTAINER_NAME}' is not running."
  echo "Start the stack first, then retry." >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

echo "Creating backup from container '${CONTAINER_NAME}'..."
docker exec "${CONTAINER_NAME}" sh -c 'export PGPASSWORD="$POSTGRES_PASSWORD"; pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  | gzip > "${BACKUP_FILE}"

if [ ! -s "${BACKUP_FILE}" ]; then
  echo "ERROR: backup file is empty: ${BACKUP_FILE}" >&2
  exit 1
fi

echo "Backup created successfully: ${BACKUP_FILE}"

