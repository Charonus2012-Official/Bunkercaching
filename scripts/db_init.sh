#!/usr/bin/env bash
set -euo pipefail

if ! command -v mysql >/dev/null 2>&1; then
  echo "Error: mysql client not found in PATH." >&2
  exit 1
fi

DB_USER="${DB_USER:-}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_HOST="${DB_HOST:-localhost}"
DB_NAME="${DB_NAME:-}"

if [[ -z "$DB_USER" || -z "$DB_PASSWORD" || -z "$DB_NAME" ]]; then
  echo "Please set DB_USER, DB_PASSWORD, and DB_NAME environment variables." >&2
  exit 1
fi

MYSQL_CMD=(mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME")

for f in bunkry.sql ropiky.sql users.sql logs.sql; do
  if [[ -f "$f" ]]; then
    echo "Importing $f ..."
    "${MYSQL_CMD[@]}" < "$f"
  else
    echo "Warning: file $f not found, skipping."
  fi
done

echo "Database initialization completed."
