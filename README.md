# Bunkercaching

Bunkercaching is a small web application for exploring and logging Czech bunkers/fortifications. It consists of a Python FastAPI backend connected to a MariaDB database and a static frontend built with plain HTML/CSS/JavaScript using Leaflet for maps.

This README documents the current state of the project, how to run it locally.

## Stack
- Backend: Python, FastAPI
- Database: MariaDB (MySQL-incompatible)
- Auth: Cookie-based JWT via `python-jose`
- Config: `.env` loaded via `python-dotenv`
- Frontend: Static HTML/CSS/JS, Leaflet map library
- Package manager(s):
  - Python: `requirements.txt` or `pyproject.toml` for uv

## Project Structure

```
./
├─ backend/
│  ├─ main.py              # FastAPI application with auth and data endpoints
│  ├─ dbh.py               # MariaDB connection using env vars via python-dotenv
│  ├─ tokens.py            # JWT creation/validation
│  ├─ generator.py         # 
│  └─ dbupload.py          # Utility to import bunkers/ropíky into DB from data files
├─ web/
│  ├─ map/                 # Map UI (Leaflet) — entry: web/map/index.html
│  ├─ auth/                # Authentication-related JS
│  ├─ about/               # Static content
│  └─ data/                # Static data (images, logos, geodata)
├─ logo                    # Contains logos
├─ *.sql                   # SQL schema/data files (bunkry.sql, ropiky.sql, users.sql, logs.sql)
└─ README.md
```

## Requirements

- Python 3.10+ (tested version not documented; 3.10/3.11 recommended)
- MariaDB server 10.x+
- Python packages: see `requirements.txt`

Install with pip:

```
python -m venv .venv                   # Create the virtualvenv
pip install -r requirements.txt        # Install the packages
```

Install with uv:
```
uv venv                                # Create the uv virtualenv
uv sync                                # Download all of the dependencies
```

## Environment Variables

Backend reads DB connection from `.env` via `backend/dbh.py`:

```
DB_USER=
DB_PASSWORD=
DB_HOST=localhost
DB_NAME=
```

JWT configuration in `backend/tokens.py` is configurable via environment variables:

```
JWT_SECRET=
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=120
```

An example file is provided as `example.env`.

## Database

Schema/data files are provided in the project root:
- `bunkry.sql`
- `ropiky.sql`
- `users.sql`
- `logs.sql`
There is also some data about `ropiky` and `bunkry`
- `backend/ropiky.json`
- `backend/bunkers.json`

You can import the schema and populate the data of your MariaDB instance, e.g.:

```
python -m backend.full_db_init
```
*Note: This also creates a new database `bunkercaching`*

### CORS configuration

The API enables CORS via FastAPI's `CORSMiddleware`. Configure allowed origins by environment variables (loaded from `.env`):

- `CORS_ALLOW_ORIGINS` — comma‑separated list of exact origins (default: `http://localhost:8080`)
- `CORS_ALLOW_ORIGIN_REGEX` — optional regex to match origins; if set, it overrides the list

Examples:

1) Allow a couple of sites during development:

```
CORS_ALLOW_ORIGINS=http://localhost:63342,http://127.0.0.1:8080,https://example.com
```

2) Allow requests from any http/https origin that is a public IP (optionally with a port):

```
CORS_ALLOW_ORIGIN_REGEX=^https?://(\d{1,3}\.){3}\d{1,3}(:\d+)?$
```

Security notes:
- You cannot use `*` for origins; prefer explicit lists or a carefully crafted regex.
- A very permissive regex can expose your API to the public internet. Use with caution and consider authentication and rate limiting.

## Running Locally

1) Create and populate a Python virtual environment, then install dependencies:

With python virtualvenv
```
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```
With uv:
```
uv venv
source .venv/bin/activate # Windows: .venv\Scripts\activate
uv sync
```

2) Create a `.env` file in the project root with DB credentials:

```
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=your_database
```

3) Initialize the database using the `backend/full_db_init.py`:

```
python -m backend.full_db_init
```

4) Start the backend API server (FastAPI app is defined in `backend/main.py` as `app`):

```
python -m uvicorn backend.main:app --reload --host localhost --port 8000
```

5) Open the frontend:
- Option A: Open `web/map/index.html` directly in a browser for static testing.
- Option B: Serve the `web/` directory with a simple static server (prevents some CORS/file access issues), e.g.:

```
python -m http.server 8080 -d web
```

By default, CORS is configurable via environment variables. If you do nothing, it allows `http://localhost:8080`. See CORS configuration below.

## API Overview of the `uvicorn` server

- `GET /` — simple HTML landing page for the API
- `POST /login` — form fields: `username`, `password`, `remember`; sets JWT cookie on success
- `POST /signup` — form fields: `username`, `email`, `password`, `confirm_password`
- `POST /me` — returns current user (requires valid cookie token)
- `POST /logout` — clears auth cookie
- `GET /ropiky?lat_one=...&lng_one=...&lat_two=...&lng_two=...` — returns ropíky in a bounding box
- `GET /bunkry?lat_one=...&lng_one=...&lat_two=...&lng_two=...` — returns bunkry in a bounding box
- `GET /search?prompt=<name>` — returns one bunker by exact name
- `GET /id?id=<opevneni_id(to)/ropiky_id(lo)>&type=<type "lo/to">` — returns the entire row from DB

## Scripts and Utilities

- `backend/dbupload.py`
  - After having the db setup you can run this to load the database with bunkers:
    ```
    python -m backend.dbupload
    ```
	*Note: The helper script automatically populates the data*
## Development Notes

- Frontend depends on CDN links for Leaflet and Google Fonts in `web/map/index.html`.
- Authentication uses JWT stored in an `HttpOnly` cookie.

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0).

- See the `LICENSE` file for the full text.
- If you contribute, you agree that your contributions will be licensed under GPL-3.0.