import mariadb
import os
from dotenv import load_dotenv

load_dotenv("../.env")


def create_connection():
    try:
        conn = mariadb.connect(
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=3306,
            database=os.getenv("DB_NAME"),
        )
        return conn
    except mariadb.Error as e:
        print(f"Chyba připojení: {e}")
        exit(1)


if __name__ == "__main__":
    db = create_connection()
    if db:
        cur = db.cursor()
        cur.execute("SELECT username, email FROM users WHERE id = 1;")
        for row in cur:
            print(row)

        cur.close()
        db.close()
