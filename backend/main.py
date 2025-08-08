import mariadb
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from dbh import create_connection

app = FastAPI()
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
def login(username: str, pwd: str):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT pwd FROM users WHERE username = ?", (username,))
            try:
                for row in cur:
                    upwd = row[0]
            except:
                return {"message": "bad"}
                upwd = 0
            cur.close()
            conn.close()
            if pwd == upwd:
                return {"message": "success"}
            else:
                return {"message": "bad"}
        except mariadb.Error as e:
            cur.close()
            conn.close()
            return {"message": "err"}
    return {"message": "dbconnerr"}


@app.post("/signup")
def signup(username: str, email: str, pwd: str):
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        try:
            cur.execute("INSERT INTO users SET username = ?, email = ?, pwd = ?", (username, email, pwd,))
            conn.commit()
        except mariadb.Error as e:
            cur.close()
            conn.close()
            return {"message": "err"}
        cur.close()
        conn.close()
        return {"message": "success"}
    return {"message": "dbconnerr"}

