from backend.dbh import create_connection
import mariadb


def ropiky():
    with open("../web/data/geodata/ropiky.geojson", "r") as f:
        ropikygeo: dict = eval(f.read())

    features = ropikygeo["features"]
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        for f in features:
            try:
                properties = f["properties"]
                name = properties["name"]
                lat, lng = f["geometry"]["coordinates"]
                web = properties["website"]
            except:
                continue
            try:
                cur.execute("INSERT INTO ropiky (name, web, museum, latitude, longitude) VALUES (?, ?, ?, ?, ?)", (name, web, 0, lng, lat))
            except:
                print("Duplicate entry")
        conn.commit()
    else:
        print("Problem")

def bunkry():
    with open("../web/data/geodata/coords.json", "r") as f:
        features: dict = eval(f.read())
    conn = create_connection()
    if conn:
        cur = conn.cursor()
        for f in features["urls"]:
            try:
                name = f["name"]
                lat, lng = f["coords"]
                website = f["link"]
                secret_name = ""
                op_id = f["id"]
                try:
                    cur.execute("INSERT INTO bunkry (opevneni_id, name, secret_name, website, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)",
                                (op_id, name, secret_name, website, lat, lng,))
                except mariadb.Error as e:
                    print(e)
            except mariadb.Error as e:
                return {"message": e}
        conn.commit()

if __name__ == "__main__":
    ropiky()
