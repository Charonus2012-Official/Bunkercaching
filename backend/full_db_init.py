import os
import mariadb



def run_sql_file(filename, cursor):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "..", filename)

    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"Executing {filename}...")
    with open(file_path, "r", encoding="utf-8") as f:
        sql_commands = f.read().split(";")

    for command in sql_commands:
        if command.strip():
            try:
                cursor.execute(command)
            except mariadb.Error as e:
                print(f"Error executing command in {filename}: {e}")


def full_db_init(conn: mariadb.Connection, dbupload: bool = True):

    if conn:
        cur = conn.cursor()
        sql_files = ["users.sql", "ropiky.sql", "bunkry.sql", "logs.sql"]
        try:
            cur.execute(f"CREATE DATABASE {os.getenv("DB_NAME", "bunkercaching")}")
        except:
            pass
        cur.execute(f"USE {os.getenv("DB_NAME", "bunkercaching")}")

        for sql_file in sql_files:
            print(sql_file)
            run_sql_file(sql_file, cur)

        conn.commit()
        print("SQL files executed. Populating data...")

        if not dbupload:
            cur.close()
            conn.close()
            return
        
        try:
            from .dbupload import ropiky, bunkry
        except ImportError, ValueError:
            from dbupload import ropiky, bunkry

        try:
            ropiky(conn)
            bunkry(conn)
            print("Data population complete.")
        except Exception as e:
            print(f"Error during data population: {e}")

        print("Database initialization complete.")
    else:
        print("Failed to connect to the database.")
    cur.close()
    conn.close()


if __name__ == "__main__":
    try:
        from .dbh import create_connection
    except ImportError, ValueError:
        from dbh import create_connection
    try:
        conn = create_connection()
        full_db_init(conn)
    except Exception as e:
        print(f"Connection error: {e}")
