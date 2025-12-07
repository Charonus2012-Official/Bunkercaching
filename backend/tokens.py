from fastapi import HTTPException, Cookie
from datetime import timedelta
import datetime
from jose import jwt, JWTError
import os
from dotenv import load_dotenv


# Load environment variables from .env if present
load_dotenv("../.env")

# Fallbacks keep current behavior if env is not configured
SECRET_KEY = os.getenv("JWT_SECRET", "cachingBuNkEr__--51384524..-CbBc")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "120"))


def create_access_token(data: dict, expires_delta: timedelta = None, remember: bool = False):
    to_encode = data.copy()
    if not remember:
        expire = datetime.datetime.now(datetime.UTC) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
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


if __name__ == "__main__":
    t = create_access_token({"sub": "Charonus2012"})
    print(t)