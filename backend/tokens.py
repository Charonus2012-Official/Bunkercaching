from fastapi import HTTPException, Cookie, Depends
from datetime import timedelta
import datetime
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

from backend.dbh import create_connection

# Load environment variables from .env if present
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(env_path)

# Fallbacks keep current behavior if env is not configured
SECRET_KEY = os.getenv("JWT_SECRET", "cachingBuNkEr__--51384524..-CbBc")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "120"))


def create_access_token(
    data: dict, expires_delta: timedelta = None, remember: bool = False
):
    to_encode = data.copy()
    if remember:
        expire = datetime.datetime.now(datetime.UTC) + timedelta(days=30)
    else:
        expire = datetime.datetime.now(datetime.UTC) + (
            expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Cookie(None)):
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_current_admin(user: dict = Depends(get_current_user)):
    conn = create_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT role FROM users WHERE username = ?", (user["username"],))
        row = cur.fetchone()
        if row is None or row[0] != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return user
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    t = create_access_token({"sub": "Charonus2012"})
    print(t)
