try:
    from .dbh import create_connection
except ImportError, ValueError:
    from dbh import create_connection
import mariadb
import json
import os


def ropiky():
    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, "ropiky.json")
    with open(file_path, "r", encoding="UTF-8") as f:
        ropikygeo = json.load(f)

    ropiks = ropikygeo["ropiky"]
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        for r in ropiks:
            d = r["data"]
            c = r["coords"]
            try:
                cur.execute(
                    """
                INSERT INTO ropiky (ropiky_id, vz36, name, sbor, úsek, řop, typ, odolnost, mnm, betonáž, krychelná, stav_1938, stav_dnes, latitude, longitude)
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        r["id"],
                        r["vz36"],
                        r["name"],
                        d["sbor"],
                        d["úsek"],
                        d["číslování"]["řop"],
                        d["typ"],
                        d["odolnost"],
                        d["nadmořská_výska"],
                        d["datum_betonáže"],
                        d["krychelná_pevnost"],
                        d["stav_1938"],
                        d["stav_dnes"],
                        c["latitude"],
                        c["longitude"],
                    ),
                )
            except Exception as e:
                print(e)
        conn.commit()
    else:
        print("Problem")


def bunkry():
    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, "bunkers.json")
    with open(file_path, "r", encoding="UTF-8") as f:
        features: dict = eval(f.read())
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        for f in features:
            try:
                name = f["name"]
                lat, lng = f["coords"]
                website = f["link"]
                try:
                    secret_name = f["secret_name"]
                    state = f["state"]
                except KeyError:
                    secret_name = ""
                    state = ""

                op_id = f["id"]
                try:
                    cur.execute(
                        "INSERT INTO bunkry (opevneni_id, name, secret_name, website, state, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (
                            op_id,
                            name,
                            secret_name,
                            website,
                            state,
                            lat,
                            lng,
                        ),
                    )
                except mariadb.Error as e:
                    print(e)
            except mariadb.Error as e:
                return {"message": e}
        conn.commit()


if __name__ == "__main__":
    ropiky()
    bunkry()
