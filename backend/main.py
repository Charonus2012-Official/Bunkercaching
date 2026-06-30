import hashlib
import json
import os

import mariadb
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

try:
    from .dbh import create_connection
    from .tokens import create_access_token, get_current_user
except (ImportError, ValueError):
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
    )
else:
    cors_kwargs.update(
        {
            "allow_origins": cors_allow_origins,  # type: ignore
        }
    )

app.add_middleware(CORSMiddleware, **cors_kwargs)  # type: ignore


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def get_user_id(username: str) -> int:
    conn = create_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM users WHERE username = ?", (username,))
        row = cur.fetchone()
        if row is None:
            return -1
        return row[0]
    except mariadb.Error:
        return -2
    finally:
        cur.close()
        conn.close()


@app.get("/api", response_class=HTMLResponse)
def read_root():
    return """
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


@app.post("/api/login")
def login(
        response: Response,
        username: str = Form(...),
        password: str = Form(...),
        remember: str = Form("false"),
):
    conn = create_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT pwd FROM users WHERE username = ?", (username,))
        row = cur.fetchone()
        if row is None:
            return {"type": "err", "msg": "Špatné uživatelské jméno nebo heslo"}
        upwd = row[0]
        if hash_password(password) != upwd:
            return {"type": "err", "msg": "Špatné uživatelské jméno nebo heslo"}
        is_remember = remember == "true"
        token = create_access_token({"sub": username}, remember=is_remember)
        cookie_kwargs = dict(key="token", value=token, httponly=True, secure=False, samesite="lax")
        if is_remember:
            cookie_kwargs["max_age"] = 3600 * 24 * 30  # 30 days
        response.set_cookie(**cookie_kwargs)
        return {"type": "scs", "msg": "success"}
    except mariadb.Error:
        return {"type": "err", "msg": "Nevim co se stalo"}
    finally:
        cur.close()
        conn.close()


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
    cur = conn.cursor()
    try:
        cur.execute("SELECT username FROM users WHERE username = ?", (username,))
        if cur.fetchone() is not None:
            return {"type": "err", "msg": "Uživatelské jméno je používané"}
        cur.execute("SELECT email FROM users WHERE email = ?", (email,))
        if cur.fetchone() is not None:
            return {"type": "err", "msg": "Email je už používaný"}
        cur.execute(
            "INSERT INTO users SET username = ?, email = ?, pwd = ?",
            (username, email, hash_password(password)),
        )
        conn.commit()
        return {"type": "scs", "msg": "Podařilo se, můžete se přihlásit"}
    except mariadb.Error:
        return {"type": "err", "msg": "Nevim co se stalo"}
    finally:
        cur.close()
        conn.close()


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
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT * FROM ropiky WHERE latitude <= ? AND latitude >= ? AND longitude >= ? AND longitude <= ?;",
            (lat_one, lat_two, lng_one, lng_two),
        )
        return {"ropiky": cur.fetchall()}
    except mariadb.Error as e:
        return {"message": str(e)}
    finally:
        cur.close()
        conn.close()


@app.get("/api/bunkry")
def get_bunkry(lat_one: float, lng_one: float, lat_two: float, lng_two: float):
    conn = create_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT * FROM bunkry WHERE latitude <= ? AND latitude >= ? AND longitude >= ? AND longitude <= ?;",
            (lat_one, lat_two, lng_one, lng_two),
        )
        return {"bunkry": cur.fetchall()}
    except mariadb.Error as e:
        return {"message": str(e)}
    finally:
        cur.close()
        conn.close()


@app.get("/api/tvrze")
def get_tvrze():
    conn = create_connection()
    cur = conn.cursor()
    cur2 = conn.cursor()
    try:
        cur.execute("SELECT * FROM tvrze;")
        tvrze: list = []
        for row in cur.fetchall():
            crow = list(row)
            crow[5] = eval(crow[5])
            bunks = []
            for obj in crow[5]:
                cur2.execute("SELECT * FROM bunkry WHERE id = ?;", (obj,))
                bunks.append(cur2.fetchone())
            crow[5] = bunks
            tvrze.append(crow)
        return {"tvrze": tvrze}
    except mariadb.Error as e:
        return {"message": str(e)}
    finally:
        cur2.close()
        cur.close()
        conn.close()


@app.get("/api/search")
def search(prompt: str):
    conn = create_connection()
    cur = conn.cursor()
    try:
        normalized_prompt = prompt.strip()
        if normalized_prompt.lower().startswith("ks") and not normalized_prompt.lower().startswith("k-s"):
            normalized_prompt = "K-S" + normalized_prompt[2:]

        cur.execute(
            "SELECT name, latitude, longitude FROM bunkry WHERE name LIKE ?",
            (f"{normalized_prompt}%",),
        )
        bunkry_results = cur.fetchall()

        cur.execute(
            "SELECT name, latitude, longitude FROM ropiky WHERE name LIKE ?",
            (f"{normalized_prompt}%",),
        )
        ropiky_results = cur.fetchall()

        results = [
                      {"name": row[0], "lat": float(row[1]), "lon": float(row[2]), "type": "Těžké opevnění"}
                      for row in bunkry_results
                  ] + [
                      {"name": row[0], "lat": float(row[1]), "lon": float(row[2]), "type": "Lehké opevnění"}
                      for row in ropiky_results
                  ]

        return {"output": results}
    except mariadb.Error as e:
        return {"message": str(e)}
    finally:
        cur.close()
        conn.close()


@app.post("/api/log")
def log(
        bunker_id: int = Form(...),
        type: str = Form(...),
        log_text: str = Form(...),
        concept: str = Form("false"),
        user: dict = Depends(get_current_user),
):
    conn = create_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id FROM users WHERE username = ?", (user["username"],))
        row = cur.fetchone()
        if row is None:
            return {"message": "Uživatel nenalezen"}
        user_id = row[0]
        cur.execute(
            "INSERT INTO logs SET type = ?, bunker_id = ?, log_text = ?, user_id = ?, is_concept = ?",
            (type, bunker_id, log_text, user_id, int(concept == "true")),
        )
        conn.commit()
        return {"message": "log put in"}
    except mariadb.Error as e:
        return {"message": str(e)}
    finally:
        cur.close()
        conn.close()

@app.post("/api/log/edit")
def edit_log(
        log_id: int = Form(...),
        log_text: str = Form(...),
        concept: str = Form("false"),
        user: dict = Depends(get_current_user),
):
    user_id = get_user_id(user["username"])
    conn = create_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT user_id FROM logs WHERE id = ?", (log_id,))
        row = cur.fetchone()
        if row is None:
            return {"message": "Log nenalezen"}
        if row[0] != user_id:
            return {"message": "Nemáte oprávnění k úpravě tohoto logu"}
        cur.execute(
            "UPDATE logs SET log_text = ?, is_concept = ?, timestamp = current_timestamp(6) WHERE id = ?",
            (log_text, (concept == "true"), log_id),
        )
        conn.commit()
        return {"message": "log updated"}
    except mariadb.Error as e:
        return {"message": str(e)}
    finally:
        cur.close()
        conn.close()

@app.post("/api/log/detail")
async def get_log_detail(
        request: Request,
        user: dict = Depends(get_current_user),
):
    user_id = get_user_id(user["username"])
    try:
        body = await request.json()
        log_id = body.get("log_id")
    except:
        return JSONResponse({"message": "Neplatný požadavek"}, status_code=400)
    
    conn = create_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, log_text, bunker_id, type, user_id, is_concept FROM logs WHERE id = ?", (log_id,))
        row = cur.fetchone()
        if row is None:
            return JSONResponse({"message": "Log nenalezen"}, status_code=404)
        if row[4] != user_id:
            return JSONResponse({"message": "Nemáte přístup k tomuto logu"}, status_code=403)
        return {"log_id": row[0], "log_text": row[1], "bunker_id": row[2], "type": row[3], "concept": row[5]}
    except mariadb.Error as e:
        return JSONResponse({"message": str(e)}, status_code=500)
    finally:
        cur.close()
        conn.close()

@app.post("/api/logsinfo")
def logsinfo(limit: int = 10, offset: int = 0, username: dict = Depends(get_current_user)):
    user_id: int = get_user_id(username["username"])
    conn = create_connection()
    cur = conn.cursor()
    try:
        # Get stats
        cur.execute("SELECT COUNT(*) FROM logs WHERE user_id = ? AND is_concept = 0", (user_id,))
        total_visited = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM logs WHERE user_id = ? AND is_concept = 0 AND type = 'to'", (user_id,))
        to_count = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM logs WHERE user_id = ? AND is_concept = 0 AND type = 'lo'", (user_id,))
        lo_count = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM logs WHERE user_id = ? AND is_concept = 1", (user_id,))
        concept_count = cur.fetchone()[0]

        # Get logs with names
        query = """
            SELECT l.id, l.bunker_id, l.type, l.log_text, l.is_concept, l.timestamp, COALESCE(b.name, r.name) as bunker_name
            FROM logs l
            LEFT JOIN bunkry b ON l.bunker_id = b.opevneni_id AND l.type = 'to'
            LEFT JOIN ropiky r ON l.bunker_id = r.ropiky_id AND l.type = 'lo'
            WHERE l.user_id = ? AND l.is_concept = 0
            ORDER BY l.timestamp DESC
            LIMIT ? OFFSET ?
        """
        cur.execute(query, (user_id, limit, offset))
        logs = cur.fetchall()

        # Get concepts
        cur.execute("""
            SELECT l.id, l.bunker_id, l.type, l.log_text, l.is_concept, l.timestamp, COALESCE(b.name, r.name) as bunker_name
            FROM logs l
            LEFT JOIN bunkry b ON l.bunker_id = b.opevneni_id AND l.type = 'to'
            LEFT JOIN ropiky r ON l.bunker_id = r.ropiky_id AND l.type = 'lo'
            WHERE l.user_id = ? AND l.is_concept = 1
            ORDER BY l.timestamp DESC
        """, (user_id,))
        concepts = cur.fetchall()

        return {
            "stats": {
                "total_visited": total_visited,
                "to_count": to_count,
                "lo_count": lo_count,
                "concept_count": concept_count
            },
            "logs": logs,
            "concepts": concepts
        }
    except mariadb.Error as e:
        return {"message": str(e)}
    finally:
        cur.close()
        conn.close()

@app.get("/api/id")
def get_by_id(id: int, type: str):
    conn = create_connection()
    cur = conn.cursor()
    try:
        if type == "lo":
            cur.execute("SELECT * FROM ropiky WHERE ropiky_id = ?", (id,))
            row = cur.fetchone()
            if row is None:
                return {"message": "Nenalezeno", "good": False}
            return {"output": row, "good": True}
        elif type == "to":
            cur.execute("SELECT * FROM bunkry WHERE opevneni_id = ?", (id,))
            row = cur.fetchone()
            if row is None:
                return {"message": "Nenalezeno", "good": False}
            return {"output": row, "good": True}
        else:
            return {"message": "Wrong type!", "good": False}
    except mariadb.Error as e:
        return {"message": str(e), "good": False}
    finally:
        cur.close()
        conn.close()


try:
    app.mount("/", StaticFiles(directory="./web", html=True), name="static")
except RuntimeError:
    app.mount("/", StaticFiles(directory="../web", html=True), name="static")
