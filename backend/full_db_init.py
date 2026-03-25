import os
import mariadb

try:
    from .dbh import create_connection
    from .dbupload import ropiky, bunkry
except ImportError, ValueError:
    from dbh import create_connection
    from dbupload import ropiky, bunkry


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


def full_db_init():
    try:
        conn = create_connection()
    except Exception as e:
        print(f"Connection error: {e}")
        return

    if conn:
        cur = conn.cursor()
        sql_files = ["users.sql", "ropiky.sql", "bunkry.sql", "logs.sql"]

        cur.execute("CREATE DATABASE bunkercaching")
        conn.commit()

        for sql_file in sql_files:
            run_sql_file(sql_file, cur)

        conn.commit()
        cur.close()
        conn.close()
        print("SQL files executed. Populating data...")

        try:
            ropiky()
            bunkry()
            print("Data population complete.")
        except Exception as e:
            print(f"Error during data population: {e}")

        print("Database initialization complete.")
    else:
        print("Failed to connect to the database.")
        return


if __name__ == "__main__":
    full_db_init()
