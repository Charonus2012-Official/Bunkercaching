import mariadb
import os
from dotenv import load_dotenv

try:
    from .full_db_init import full_db_init
except (ImportError, ValueError):
    from full_db_init import full_db_init

env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(env_path)

_pool: mariadb.ConnectionPool = None


def _init_db():
    """Initialize the database if it doesn't exist, then create the pool."""
    global _pool
    try:
        _pool = mariadb.ConnectionPool(
            pool_name="bunkercaching",
            pool_size=20,
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=3306,
            database=os.getenv("DB_NAME", "bunkercaching"),
        )
    except mariadb.Error as e:
        if str(e) == f"Unknown database '{os.getenv('DB_NAME', 'bunkercaching')}'":
            # DB doesn't exist yet — init it first
            conn = mariadb.connect(
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                host=os.getenv("DB_HOST"),
                port=3306,
            )
            full_db_init(conn, False)
            conn.close()

            # Now create the pool against the freshly created DB
            _pool = mariadb.ConnectionPool(
                pool_name="bunkercaching",
                pool_size=10,
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD"),
                host=os.getenv("DB_HOST"),
                port=3306,
                database=os.getenv("DB_NAME", "bunkercaching"),
            )

            # Seed initial data
            seed_conn = _pool.get_connection()
            try:
                from .dbupload import ropiky, bunkry, tvrze
            except (ImportError, ValueError):
                from dbupload import ropiky, bunkry, tvrze
            ropiky(seed_conn)
            bunkry(seed_conn)
            tvrze(seed_conn)
            seed_conn.close()
        else:
            print(f"Chyba připojení: {e}")
            exit(1)


def create_connection():
    global _pool
    if _pool is None:
        _init_db()
    return _pool.get_connection()


if __name__ == "__main__":
    db = create_connection()
    if db:
        cur = db.cursor()
        cur.close()
        db.close()
