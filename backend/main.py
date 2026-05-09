import hashlib
import json
import os

import mariadb
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

try:
    from .dbh import create_connection
    from .tokens import create_access_token, get_current_user
except ImportError, ValueError:
    from dbh import create_connection
    from tokens import create_access_token, get_current_user

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(env_path)

app = FastAPI()


# CORS configuration via environment variables
#
# CORS_ALLOW_ORIGINS: comma-separated list of origins
# CORS_ALLOW_ORIGIN_REGEX: regex pattern for allowed origins (overrides list when set)
# CORS_ALLOW_CREDENTIALS: "true"/"false" (defaults to true)
# CORS_ALLOW_METHODS: comma-separated HTTP methods or *
# CORS_ALLOW_HEADERS: comma-separated headers or *


def _get_list(env_name: str, default: str):
    raw = os.getenv(env_name, default)
    if raw.strip() == "*":
        return ["*"]
    return [item.strip() for item in raw.split(",") if item.strip()]


cors_allow_origins = _get_list("CORS_ALLOW_ORIGINS", "http://localhost:8000")
cors_allow_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX", "").strip() or None
cors_allow_credentials = True
cors_allow_methods = "*"
cors_allow_headers = "*"

cors_kwargs = dict(
    allow_credentials=cors_allow_credentials,
    allow_methods=cors_allow_methods,
    allow_headers=cors_allow_headers,
)

if cors_allow_origin_regex:
    cors_kwargs.update(
        {
            "allow_origins": [],  # use regex instead
            "allow_origin_regex": cors_allow_origin_regex,  # type: ignore
        }
    )  # type: ignore
else:
    cors_kwargs.update(
        {
            "allow_origins": cors_allow_origins,  # type: ignore
        }
    )  # type: ignore

app.add_middleware(CORSMiddleware, **cors_kwargs)  # type: ignore


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


@app.get("/api", response_class=HTMLResponse)
def read_root():
    html_content = """
    <html>
        <head>
            <title>Bunkercaching API</title>
        </head>
        <body>
            <h1>Bunkercaching API Endpoint</h1>
            <p>An API for a fun game of logging czech bunkers from the ww2.</p>
        </body>
    </html>
    """
    return html_content


@app.post("/api/login")
def login(
    response: Response,
    username: str = Form(...),
    password: str = Form(...),
    remember: str = Form("false"),
):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        upwd = ""
        try:
            cur.execute("SELECT pwd FROM users WHERE username = ?", (username,))
            try:
                for row in cur:
                    upwd = row[0]
            except:
                return {"type": "err", "msg": "Špatné uživatelské jméno nebo heslo"}
            cur.close()
            conn.close()
            if hash_password(password) == upwd:
                is_remember = remember == "true"
                token = create_access_token(
                    {"sub": username}, remember=is_remember
                )
                if is_remember:
                    response.set_cookie(
                        key="token",
                        value=token,
                        httponly=True,
                        secure=False,
                        samesite="lax",
                        max_age=3600 * 24 * 30,  # 30 days
                    )
                else:
                    response.set_cookie(
                        key="token",
                        value=token,
                        httponly=True,
                        secure=False,
                        samesite="lax",
                    )
                return {"type": "scs", "msg": "success"}
            else:
                return {"type": "err", "msg": "Špatné uživatelské jméno nebo heslo"}
        except mariadb.Error as e:
            cur.close()
            conn.close()
            return {"type": "err", "msg": "Nevim co se stalo"}
    return {"type": "err", "msg": "Chyba připojení do databáze"}


@app.post("/api/signup")
def signup(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
):
    if password != confirm_password:
        return {"type": "err", "msg": "Hesla se neshodují"}
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT username FROM users WHERE username = ?", (username,))
            i = 0
            for row in cur:
                i += 1
            if i != 0:
                return {"type": "err", "msg": "Uživatelské jméno je používané"}
            cur.execute("SELECT email FROM users WHERE email = ?", (email,))
            i = 0
            for row in cur:
                i += 1
            if i != 0:
                return {"type": "err", "msg": "Email je už používaný"}
        except mariadb.Error as e:
            return {"type": "err", "msg": "Nevim co se stalo"}
        try:
            cur.execute(
                "INSERT INTO users SET username = ?, email = ?, pwd = ?",
                (
                    username,
                    email,
                    hash_password(password),
                ),
            )
            conn.commit()
        except mariadb.Error as e:
            cur.close()
            conn.close()
            return {"type": "err", "msg": "Nevim co se stalo"}
        cur.close()
        conn.close()
        return {"type": "scs", "msg": "Podařilo se, můžete se přihlásit"}
    return {"type": "err", "msg": "Chyba připojení do databáze"}


@app.post("/api/me")
def me(user: dict = Depends(get_current_user)):
    return {"username": user["username"]}


@app.post("/api/logout")
def logout(response: Response):
    response.delete_cookie("token")
    return {"message": "Logged out"}


@app.get("/api/ropiky")
def get_ropiky(lat_one: float, lng_one: float, lat_two: float, lng_two: float):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute(
                "SELECT * FROM ropiky WHERE latitude <= ? AND latitude >= ? AND longitude >= ? AND longitude <= ?;",
                (
                    lat_one,
                    lat_two,
                    lng_one,
                    lng_two,
                ),
            )
            ropiky: list = []
            for row in cur:
                ropiky.append(row)
            return {"ropiky": ropiky}
        except mariadb.Error as e:
            return {"message": e}
    return None


@app.get("/api/bunkry")
def get_bunkry(lat_one: float, lng_one: float, lat_two: float, lng_two: float):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute(
                "SELECT * FROM bunkry WHERE latitude <= ? AND latitude >= ? AND longitude >= ? AND longitude <= ?;",
                (
                    lat_one,
                    lat_two,
                    lng_one,
                    lng_two,
                ),
            )
            ropiky: list = []
            for row in cur:
                ropiky.append(row)
            return {"bunkry": ropiky}
        except mariadb.Error as e:
            return {"message": e}
    return None

@app.get("/api/tvrze")
def get_tvrze():
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM tvrze;")
            tvrze: list = []
            for row in cur:
                crow = list(row)
                crow[5] = eval(crow[5])
                cur2 = conn.cursor()
                bunks = []
                for obj in crow[5]:
                    cur2.execute("SELECT * FROM bunkry WHERE id = ?;", (obj,))
                    bunks.append(cur2.fetchone())
                crow[5] = bunks
                tvrze.append(crow)
            return {"tvrze": tvrze}
        except mariadb.Error as e:
            return {"message": e}
    return None


@app.get("/api/search")
def search(prompt: str):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        try:
            # Normalize prompt: trim and handle common prefix without hyphen
            # MariaDB with utf8mb4_unicode_ci is case-insensitive by default for '='
            normalized_prompt = prompt.strip()
            
            # Simple normalization for 'ks' shorthand to 'K-S'
            # If it starts with 'ks' (case-insensitive) and it's not 'k-s'
            if normalized_prompt.lower().startswith("ks") and not normalized_prompt.lower().startswith("k-s"):
                normalized_prompt = "K-S" + normalized_prompt[2:]

            # Search in bunkry (prefix search)
            cur.execute(
                "SELECT name, latitude, longitude, 'to' as type FROM bunkry WHERE name LIKE ?",
                (f"{normalized_prompt}%",),
            )
            bunkry_results = cur.fetchall()

            # Search in ropiky (prefix search)
            cur.execute(
                "SELECT name, latitude, longitude, 'lo' as type FROM ropiky WHERE name LIKE ?",
                (f"{normalized_prompt}%",),
            )
            ropiky_results = cur.fetchall()

            results = []
            for row in bunkry_results:
                results.append(
                    {
                        "name": row[0],
                        "lat": float(row[1]),
                        "lon": float(row[2]),
                        "type": "Těžké opevnění",
                    }
                )
            for row in ropiky_results:
                results.append(
                    {
                        "name": row[0],
                        "lat": float(row[1]),
                        "lon": float(row[2]),
                        "type": "Lehké opevnění",
                    }
                )

            return {"output": results}
        except mariadb.Error as e:
            return {"message": str(e)}
        finally:
            cur.close()
            conn.close()
    return {"output": []}


@app.post("/api/log")
def log(
    bunker_id: int = Form(...),
    type: str = Form(...),
    log_text: str = Form(...),
    concept: str = Form("false"),
    user: dict = Depends(get_current_user),
):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT id FROM users WHERE username = ?", (user["username"],))
            user_id = cur.fetchone()[0]
        except mariadb.Error as e:
            return {"message": e}
        try:
            cur.execute(
                "INSERT INTO logs SET type = ?, bunker_id = ?, log_text = ?, user_id = ?, is_concept = ?",
                (type, bunker_id, log_text, user_id, int(concept == "true")),
            )
            conn.commit()
        except mariadb.Error as e:
            return {"message": e}

        return {"message": "log put in"}


@app.get("/api/id")
def get_by_id(id: int, type: str):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        if type == "lo":
            try:
                cur.execute("SELECT * FROM ropiky WHERE ropiky_id = ?", (id,))
                searched: list = []
                for row in cur.fetchall():
                    searched.append(row)
                return {"output": searched[0]}
            except mariadb.Error as e:
                return {"message": e}
        elif type == "to":
            try:
                cur.execute("SELECT * FROM bunkry WHERE opevneni_id = ?", (id,))
                searches: list = []
                for row in cur.fetchall():
                    searches.append(row)
                return {"output": searches[0]}
            except (mariadb.Error, IndexError) as e:
                return {"message": str(e)}
        else:
            return {"message": "Wrong type!"}


try:
    app.mount("/", StaticFiles(directory="./web", html=True), name="static")
except RuntimeError:
    app.mount("/", StaticFiles(directory="../web", html=True), name="static")
