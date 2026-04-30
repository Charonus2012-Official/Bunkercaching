FROM python:3.12-slim

# System deps (psycopg2 needs libpq, PostGIS clients optional)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy dependency files first for layer caching
COPY pyproject.toml uv.lock* ./

# Install dependencies (no dev deps, system Python)
RUN uv sync --frozen --no-dev

# Copy the rest of the project
COPY . .

# Run dbh.py first (DB init/migrations), then start uvicorn
CMD ["sh", "-c", "export JWT_SECRET=$(openssl rand -hex 32) && uv run python backend/dbh.py && uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000"]
