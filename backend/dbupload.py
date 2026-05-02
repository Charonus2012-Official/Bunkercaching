import mariadb
import json
import os


def ropiky(conn: mariadb.Connection):
    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, "ropiky.json")
    with open(file_path, "r", encoding="UTF-8") as f:
        ropikygeo = json.load(f)

    ropiks = ropikygeo["ropiky"]
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


def bunkry(conn: mariadb.Connection):
    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, "bunkers.json")
    with open(file_path, "r", encoding="UTF-8") as f:
        bunks = json.load(f)
    if conn:
        cur = conn.cursor()
        for bunker in bunks:
            try:
                cur.execute("""
                            INSERT INTO bunkry (
                                opevneni_id, name, secret_name, website, stav, usek, podusek,
                                typ, odolnost, tvrz, other_secret, lpv, ppv, azimut_l, azimut_p,
                                teren, lomeni, nm_vyska, osadka, ventilace, filtry, bet_objem,
                                studna, vykres, betonaz, firma, latitude, longitude
                            ) VALUES (
                                         ?, ?, ?, ?, ?, ?, ?,
                                         ?, ?, ?, ?, ?, ?, ?, ?,
                                         ?, ?, ?, ?, ?, ?, ?,
                                         ?, ?, ?, ?, ?, ?
                                     )
                            """, (
                                bunker["id"],
                                bunker["name"],
                                bunker["secret_name"],
                                bunker["link"],
                                bunker["data"]["stav"],
                                bunker["usek"],
                                bunker["podusek"],
                                bunker["data"]["typ"],
                                bunker["data"]["odolnost"],
                                bunker["data"]["tvrz"],
                                bunker["data"]["jina_kryci_jmena"],
                                bunker["data"]["LPV"],
                                bunker["data"]["PPV"],
                                bunker["data"]["azimut L"],
                                bunker["data"]["azimut P"],
                                bunker["data"]["teren"],
                                bunker["data"]["lomeni"],
                                bunker["data"]["nm_vyska"],
                                bunker["data"]["osadka"],
                                bunker["data"]["ventilace"],
                                bunker["data"]["filtry"],
                                bunker["data"]["bet_objem"],
                                bunker["data"]["studna"],
                                bunker["data"]["vykres"],
                                bunker["data"]["betonaz"],
                                bunker["data"]["firma"],
                                bunker["geo"]["lat"],
                                bunker["geo"]["lng"],
                            ))
            except Exception as e:
                print("Error: " + str(e))

        conn.commit()


if __name__ == "__main__":
    try:
        from .dbh import create_connection
    except ImportError, ValueError:
        from dbh import create_connection
    
    conn = create_connection()
    
    ropiky(conn)
    bunkry(conn)
    
    conn.close()
