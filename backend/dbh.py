import mariadb
import os
from dotenv import load_dotenv

try:
    from .full_db_init import full_db_init
except (ImportError, ValueError)    :
    from full_db_init import full_db_init

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(env_path)


def create_connection():
    try:
        conn = mariadb.connect(
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=3306,
            database=os.getenv("DB_NAME", "bunkercaching"),
        )
        return conn
    except mariadb.Error as e:
        if str(e) == f"Unknown database '{os.getenv("DB_NAME", "bunkercaching")}'":
            conn = mariadb.connect(
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                host=os.getenv("DB_HOST"),
                port=3306,
            )
            full_db_init(conn, False)
            new = create_connection()
            try:
                from .dbupload import ropiky, bunkry, tvrze
            except ImportError, ValueError:
                from dbupload import ropiky, bunkry, tvrze
            ropiky(new)
            bunkry(new)
            tvrze(new)

            return new
        print(f"Chyba připojení: {e}")
        exit(1)


if __name__ == "__main__":
    db = create_connection()
    if db:
        cur = db.cursor()

        cur.close()
        db.close()
