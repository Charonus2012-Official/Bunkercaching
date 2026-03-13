import mariadb
import hashlib
import os
from fastapi import FastAPI, Form, Response, Depends
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from dbh import create_connection
from tokens import create_access_token, get_current_user

load_dotenv("../.env")

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

cors_allow_origins = _get_list("CORS_ALLOW_ORIGINS", "http://localhost:63342")
cors_allow_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX", "").strip() or None
cors_allow_credentials = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
cors_allow_methods = _get_list("CORS_ALLOW_METHODS", "*")
cors_allow_headers = _get_list("CORS_ALLOW_HEADERS", "*")

cors_kwargs = dict(
    allow_credentials=cors_allow_credentials,
    allow_methods=cors_allow_methods,
    allow_headers=cors_allow_headers,
)

if cors_allow_origin_regex:
    cors_kwargs.update({
        "allow_origins": [],  # use regex instead
        "allow_origin_regex": cors_allow_origin_regex,
    })
else:
    cors_kwargs.update({
        "allow_origins": cors_allow_origins,
    })

app.add_middleware(CORSMiddleware, **cors_kwargs)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

@app.get("/", response_class=HTMLResponse)
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

@app.post("/login")
def login(
response: Response,
username: str = Form(...),
password: str = Form(...),
remember: str = Form(...)
):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
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
                token = create_access_token({"sub": username}, remember=remember)
                if remember:
                    response.set_cookie(
                        key="token",
                        value=token,
                        httponly=True,
                        secure=False,
                        samesite="lax",
                        max_age=3600*2,
                        expires=3600*2
                    )
                else:
                    response.set_cookie(
                        key="token",
                        value=token,
                        httponly=True,
                        secure=False,
                        samesite="lax"
                    )
                return {"type": "scs", "msg": "success"}
            else:
                return {"type": "err", "msg": "Špatné uživatelské jméno nebo heslo"}
        except mariadb.Error as e:
            cur.close()
            conn.close()
            return {"type": "err", "msg": "Nevim co se stalo"}
    return {"type": "err", "msg": "Chyba připojení do databáze"}


@app.post("/signup")
def signup(
        username: str = Form(...),
        email: str = Form(...),
        password: str = Form(...),
        confirm_password: str = Form(...)
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
            cur.execute("INSERT INTO users SET username = ?, email = ?, pwd = ?", (username, email, hash_password(password),))
            conn.commit()
        except mariadb.Error as e:
            cur.close()
            conn.close()
            return {"type": "err", "msg": "Nevim co se stalo"}
        cur.close()
        conn.close()
        return {"type": "scs", "msg": "Podařilo se, můžete se přihlásit"}
    return {"type": "err", "msg": "Chyba připojení do databáze"}

@app.post("/me")
def me(user: dict = Depends(get_current_user)):
    return {"username": user["username"]}

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie("token")
    return {"message": "Logged out"}

@app.get("/ropiky")
def get_ropiky(lat_one: float, lng_one: float, lat_two: float, lng_two: float):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM ropiky WHERE latitude <= ? AND latitude >= ? AND longitude >= ? AND longitude <= ?;", (lat_one, lat_two, lng_one, lng_two,))
            ropiky: list = []
            for row in cur:
                ropiky.append(row)
            return {"ropiky": ropiky}
        except mariadb.Error as e:
            return {"message": e}
    return None

@app.get("/bunkry")
def get_bunkry(lat_one: float, lng_one: float, lat_two: float, lng_two: float):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT * FROM bunkry WHERE latitude <= ? AND latitude >= ? AND longitude >= ? AND longitude <= ?;", (lat_one, lat_two, lng_one, lng_two,))
            ropiky: list = []
            for row in cur:
                ropiky.append(row)
            return {"bunkry": ropiky}
        except mariadb.Error as e:
            return {"message": e}
    return None

@app.get("/search")
def search(prompt: str):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT name, latitude, longitude FROM bunkry WHERE name = ?", (prompt,))
            searches: list = []
            for row in cur:
                searches.append(row)
            return {"output": searches[0]}
        except mariadb.Error as e:
            return {"message": e}


@app.post("/log")
def log():
    pass


@app.get("/id")
def get_by_id(id: int, type: str):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        if type == "lo":
            try:
                cur.execute("SELECT * FROM ropiky WHERE ropiky_id = ?", (id,))
                searches: list = []
                for row in cur.fetchall():
                    searches.append(row)
                return {"output": searches[0]}
            except mariadb.Error as e:
                return {"message": e}
        elif type == "to":
            try:
                cur.execute("SELECT * FROM bunkry WHERE opevneni_id = ?", (id,))
                searches: list = []
                for row in cur.fetchall():
                    searches.append(row)
                return {"output": searches[0]}
            except mariadb.Error as e:
                return {"message": e}
        else:
            return {"message": "Wrong type!"}