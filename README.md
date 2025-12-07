# Bunkercaching

Bunkercaching is a small web application for exploring and logging Czech bunkers/fortifications. It consists of a Python FastAPI backend connected to a MariaDB database and a static frontend built with plain HTML/CSS/JavaScript using Leaflet for maps.

This README documents the current state of the project, how to run it locally, and what still needs to be clarified (see TODOs).

## Stack
- Backend: Python, FastAPI
- Database: MariaDB (MySQL-compatible)
- Auth: Cookie-based JWT via `python-jose`
- Config: `.env` loaded via `python-dotenv`
- Frontend: Static HTML/CSS/JS, Leaflet map library
- Package manager(s):
  - Python: No `requirements.txt` or `pyproject.toml` found (see TODO)
  - Frontend: No `package.json` found; frontend appears to be vanilla JS with CDN dependencies

## Project Structure

```
./
├─ backend/
│  ├─ main.py              # FastAPI application with auth and data endpoints
│  ├─ dbh.py               # MariaDB connection using env vars via python-dotenv
│  ├─ tokens.py            # JWT creation/validation (SECRET_KEY currently hardcoded)
│  └─ dbupload.py          # Utility to import bunkers/ropíky into DB from data files
├─ web/
│  ├─ map/                 # Map UI (Leaflet) — entry: web/map/index.html
│  ├─ auth/                # Authentication-related JS
│  ├─ about/               # Static content
│  └─ data/                # Static data (images, logos, geodata)
├─ common/                 # Domain data (e.g., bunkers)
├─ data/                   # MariaDB data directories (local DB files) — not needed for deployment
├─ *.sql                   # SQL schema/data files (bunkry.sql, ropiky.sql, users.sql, logs.sql)
└─ README.md
```

## Requirements

- Python 3.10+ (tested version not documented; 3.10/3.11 recommended)
- MariaDB server 10.x+
- Python packages:
  - `fastapi`
  - `uvicorn` (for local dev server)
  - `mariadb` (Python MariaDB connector)
  - `python-dotenv`
  - `python-jose[cryptography]`

Note: There is currently no `requirements.txt` in the repo.

## Environment Variables

Backend reads DB connection from `.env` via `backend/dbh.py`:

```
DB_USER=
DB_PASSWORD=
DB_HOST=localhost
DB_NAME=
```

JWT configuration in `backend/tokens.py` currently uses a hardcoded `SECRET_KEY`. For production, this should be moved to environment variables. See TODOs.

## Database

Schema/data files are provided in the project root:
- `bunkry.sql`
- `ropiky.sql`
- `users.sql`
- `logs.sql`

You can import them into your MariaDB instance, e.g.:

```
mysql -u <user> -p <db_name> < bunkry.sql
mysql -u <user> -p <db_name> < ropiky.sql
mysql -u <user> -p <db_name> < users.sql
mysql -u <user> -p <db_name> < logs.sql
```

There is also a helper script `backend/dbupload.py` that can populate tables from JSON/GeoJSON files in the `web/data` directory. Review the script before running it.

## Running Locally

1) Create and populate a Python virtual environment, then install dependencies:

```
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install fastapi uvicorn mariadb python-dotenv "python-jose[cryptography]"
```

2) Create a `.env` file in the project root (or in `backend/`) with DB credentials:

```
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=your_database
```

3) Initialize the database using the SQL files in the repo (see Database section).

4) Start the backend API server (FastAPI app is defined in `backend/main.py` as `app`):

```
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

5) Open the frontend:
- Option A: Open `web/map/index.html` directly in a browser for static testing.
- Option B: Serve the `web/` directory with a simple static server (prevents some CORS/file access issues), e.g.:

```
python -m http.server 8080 -d web
```

By default, CORS in `backend/main.py` allows origin `http://localhost:63342` (JetBrains IDE). Adjust or extend `origins` as needed during development.

## API Overview (selected endpoints)

- `GET /` — simple HTML landing page for the API
- `POST /login` — form fields: `username`, `password`, `remember`; sets JWT cookie on success
- `POST /signup` — form fields: `username`, `email`, `password`, `confirm_password`
- `POST /me` — returns current user (requires valid cookie token)
- `POST /logout` — clears auth cookie
- `GET /ropiky?lat_one=...&lng_one=...&lat_two=...&lng_two=...` — returns ropíky in a bounding box
- `GET /bunkry?lat_one=...&lng_one=...&lat_two=...&lng_two=...` — returns bunkry in a bounding box
- `GET /search?prompt=<name>` — returns one bunker by exact name

## Scripts and Utilities

- `backend/dbupload.py`
  - `bunkry()` — imports items from `backend/bunkers.json` into `bunkry` table
  - `ropiky()` — imports from `web/data/geodata/ropiky.geojson` into `ropiky` table
  - Run as a script to execute `bunkry()` by default:
    ```
    python -m backend.dbupload
    ```

## Tests

No tests were found in the repository. TODO: add unit tests and/or integration tests for API endpoints and DB access.

## Development Notes

- Frontend depends on CDN links for Leaflet and Google Fonts in `web/map/index.html`.
- Authentication uses JWT stored in an `HttpOnly` cookie.
- The CORS `origins` list is currently limited to `http://localhost:63342`.

## TODOs / Open Questions

- Create `requirements.txt` (or `pyproject.toml`) with exact versions of dependencies.
- Move JWT `SECRET_KEY`, algorithm, and expiry to environment variables; do not hardcode secrets.
- Confirm supported Python version(s) and document them.
- Provide instructions or scripts to provision the DB schema automatically (migrations, etc.).
- Clarify deployment approach (production server, reverse proxy, static hosting for `web/`).
- Add tests and a CI workflow.
- Add a license file (see next section).

## License

No license file was found. If you intend to open source this project, add a `LICENSE` file (e.g., MIT, Apache-2.0) and update this section accordingly.