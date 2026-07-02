// Settings
const ropikyZoomLevel = 14;
const bunkryZoomLevel = 10;

const MAPY_COM_API_KEY = "Vtuv43i3ze9T5MzXJC-eWCNRSDYz4ucQnaQGg8PIA0k";
var markers_ropiky = [];
var markers_bunkry = [];
var markers_tvrze  = [];

const map = L.map("map", { zoomControl: false }).setView([50.0956928, 16.7678179], 11);
window.exportedMap = map;
L.control.zoom({ position: "topleft" }).addTo(map);
const tileLayers = {
  "Mapy.com": L.tileLayer(
    `https://api.mapy.com/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${MAPY_COM_API_KEY}`,
    {
      minZoom: 3,
      maxZoom: 19,
      attribution:
        '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    },
  ),
  "Satelitní Mapy.com": L.tileLayer(
    `https://api.mapy.com/v1/maptiles/aerial/256/{z}/{x}/{y}?apikey=${MAPY_COM_API_KEY}`,
    {
      minZoom: 3,
      maxZoom: 19,
      attribution:
        '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    },
  ),
  OpenStreetMap: L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      minZoom: 3,
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  ),
};

tileLayers["Mapy.com"].addTo(map);

L.control.layers(tileLayers, {}, { position: "topright" }).addTo(map);

const LogoControl = L.Control.extend({
  options: {
    position: "bottomleft",
  },

  onAdd: function (map) {
    const container = L.DomUtil.create("div");
    const link = L.DomUtil.create("a", "", container);

    link.setAttribute("href", "http://mapy.com/");
    link.setAttribute("target", "_blank");
    link.innerHTML = '<img src="https://api.mapy.com/img/api/logo.svg" />';
    L.DomEvent.disableClickPropagation(link);

    return container;
  },
});

let mapy_com_icon = new LogoControl();

async function map_com_icon(activeBase) {
  if (activeBase == "Mapy.com" || activeBase == "Satelitní Mapy.com") {
    mapy_com_icon.addTo(map);
  } else if (mapy_com_icon._map) {
    map.removeControl(mapy_com_icon);
  }
}

map_com_icon("Mapy.com");

map.on("baselayerchange", function (e) {
  map_com_icon(e.name);
});

var ropikIcon = L.icon({
  iconUrl: "../data/images/ropik.png", // obrázek (může být i URL)
  iconSize: [32, 32], // velikost obrázku
  iconAnchor: [16, 32], // kotva (střed ikony)
  popupAnchor: [0, -16], // kde se otevře popup
});

var ropikIcon_not = L.icon({
  iconUrl: "../data/images/ropik_not_built.png", // obrázek (může být i URL)
  iconSize: [32, 32], // velikost obrázku
  iconAnchor: [16, 32], // kotva (střed ikony)
  popupAnchor: [0, -16], // kde se otevře popup
});

var bunkrIcon = L.icon({
  iconUrl: "../data/images/bunkr.png", // obrázek (může být i URL)
  iconSize: [32, 32], // velikost obrázku
  iconAnchor: [16, 32], // kotva (střed ikony)
  popupAnchor: [0, -16], // kde se otevře popup
});

var bunkrIcon_not = L.icon({
  iconUrl: "../data/images/bunkr_not_built.png", // obrázek (může být i URL)
  iconSize: [32, 32], // velikost obrázku
  iconAnchor: [16, 32], // kotva (střed ikony)
  popupAnchor: [0, -16], // kde se otevře popup
});

var tvrzIcon = L.icon({
  iconUrl: "../data/images/tvrz.png",
  iconSize: [48, 48],
  iconAnchor: [32, 48],
  popupAnchor: [0, -16],
})

async function getRopiky() {
  var bounds = map.getBounds();
  var topLeft = bounds.getNorthWest();
  var bottomRight = bounds.getSouthEast();

  lat_one = topLeft.lat;
  lng_one = topLeft.lng;
  lat_two = bottomRight.lat;
  lng_two = bottomRight.lng;

  const url = `/api/ropiky?lat_one=${lat_one}&lng_one=${lng_one}&lat_two=${lat_two}&lng_two=${lng_two}`;
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    const data = await response.json();

    markers_ropiky.forEach((r) => {
      r.remove();
    });
    markers_ropiky = [];

    data.ropiky.forEach((r) => {
      const id = r[0];
      const ropiky_id = r[1];
      const vz36 = r[2];
      const name = r[3];
      const sbor = r[4];
      const úsek = r[5];
      const rop = r[6];
      const typ = r[7];
      const odolnost = r[8];
      const mnm = r[9];
      const betonaz = r[10];
      const krychelna = r[11];
      const stav_1938 = r[12];
      const stav_dnes = r[13];
      const lat = r[14];
      const lng = r[15];
      if (lat === 0 && lng === 0) {
        return; // Skip this iteration if lat and lng are both 0
      }
      if (stav_dnes == "dochován") {
        var marker = L.marker([lat, lng], { icon: ropikIcon });
      } else {
        var marker = L.marker([lat, lng], { icon: ropikIcon_not });
      }
      marker.addTo(map);
      marker.on("click", function (e) {
        const ropikyEvent = new CustomEvent("OnRopikyClickEvent", {
          detail: {
            id: ropiky_id,
            name: name,
            vz36: vz36,
            sbor: sbor,
            úsek: úsek,
            typ: typ,
            odolnost: odolnost,
            mnm: mnm,
            stav_1938: stav_1938,
            stav_dnes: stav_dnes,
            lat: lat,
            lng: lng,
            website: "https://ropiky.net/dbase_objekt.php?id=" + ropiky_id,
        }});
        window.dispatchEvent(ropikyEvent);
      });
      markers_ropiky.push(marker);
    });
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

async function getTvrze() {
  const url = `/api/tvrze`;
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    const data = await response.json();

    markers_tvrze.forEach((r) => {
      r.remove();
    });
    markers_tvrze = [];

    data.tvrze.forEach((r) => {
      const id = r[0];
      const opevneni_id = r[1];
      const name = r[2];
      const shortcut = r[3];
      const website = r[4];
      const objects = r[5];
      const usek = r[6];
      const podusek = r[7];
      const stav = r[8];
      const pocet_objektu = r[9];
      const postavene_objekty = r[10];
      const reseni_vo = r[11];
      const osadka = r[12];
      const jine_nazvy = r[13];
      const lat = r[14];
      const lng = r[15];
      if (lat === 0 && lng === 0) {
        return; // Skip this iteration if lat and lng are both 0
      }
      var marker = L.marker([lat, lng], { icon: tvrzIcon, zIndexOffset: 1000 });
      marker.addTo(map);
      marker.on("click", function (e) {
        const bunkryEvent = new CustomEvent("OnTvrzeClickEvent", {
          detail: {
            id: opevneni_id,
            name: name,
            shortcut: shortcut,
            website: website,
            objects: objects,
            usek: usek,
            podusek: podusek,
            stav: stav,
            pocet_objektu: pocet_objektu,
            postavene_objekty: postavene_objekty,
            reseni_vo: reseni_vo,
            osadka: osadka,
            jine_nazvy: jine_nazvy
          },
        });
        window.dispatchEvent(bunkryEvent);
      });
      markers_tvrze.push(marker);
    });
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

async function getBunkry() {
  var bounds = map.getBounds();
  var topLeft = bounds.getNorthWest();
  var bottomRight = bounds.getSouthEast();

  lat_one = topLeft.lat;
  lng_one = topLeft.lng;
  lat_two = bottomRight.lat;
  lng_two = bottomRight.lng;

  const url = `/api/bunkry?lat_one=${lat_one}&lng_one=${lng_one}&lat_two=${lat_two}&lng_two=${lng_two}`;
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) {
      throw new Error("HTTP error " + response.status);
    }
    const data = await response.json();

    markers_bunkry.forEach((r) => {
      r.remove();
    });
    markers_bunkry = [];

    data.bunkry.forEach((r) => {
      const id = r[0];
      const opevneni_id = r[1];
      const name = r[2];
      const secret_name = r[3];
      const website = r[4];
      const stav = r[5];
      const usek = r[6];
      const podusek = r[7];
      const typ = r[8];
      const odolnost = r[9];
      const tvrz = r[10];
      const nm_vyska = r[18];
      const osadka = r[19];
      const studna = r[23];
      const vykres = r[24];
      const betonaz = r[25];
      const firma = r[26];
      const lat = r[27];
      const lng = r[28];
      if (lat === 0 && lng === 0) {
        return; // Skip this iteration if lat and lng are both 0
      }
      if (stav == "Postaven") {
        var marker = L.marker([lat, lng], { icon: bunkrIcon });
      } else {
        var marker = L.marker([lat, lng], { icon: bunkrIcon_not });
      }
      marker.addTo(map);
      marker.on("click", function (e) {
        const bunkryEvent = new CustomEvent("OnBunkryClickEvent", {
          detail: {
            id: opevneni_id,
            name: name,
            secret_name: secret_name,
            website: website,
            stav: stav,
            usek: usek,
            podusek: podusek,
            typ: typ,
            odolnost: odolnost,
            tvrz: tvrz,
            nm_vyska: nm_vyska,
            osadka: osadka,
            betonaz: betonaz,
            studna: studna,
            vykres: vykres,
            firma: firma,
            lat: lat,
            lng: lng
          },
        });
        window.dispatchEvent(bunkryEvent);
      });
      markers_bunkry.push(marker);
    });
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

async function detectBunkers() {
  if (map.getZoom() >= ropikyZoomLevel) {
    getRopiky();
  }
  if (map.getZoom() >= bunkryZoomLevel) {
    getBunkry();
  }
}

detectBunkers();
getTvrze();

map.on("moveend", function (e) {
  detectBunkers();
});

window.addEventListener("map_resize_leaf", function (e) {
  setTimeout(() => {
    map.invalidateSize();
  }, 200);
});

if (typeof BunkerPlaceSearch !== 'undefined') {
  const searchControl = new BunkerPlaceSearch({ position: 'topright' });
  searchControl.addTo(map);
}
