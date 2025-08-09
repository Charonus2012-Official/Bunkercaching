import mariadb
import hashlib
from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
from starlette.middleware.cors import CORSMiddleware

from dbh import create_connection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Sem můžeš dát třeba ["http://localhost:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
username: str = Form(...),
password: str = Form(...)
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

