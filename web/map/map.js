// Settings
const ropikyZoomLevel = 10;
const bunkryZoomLevel = 8;

const MAPY_COM_API_KEY = "Vtuv43i3ze9T5MzXJC-eWCNRSDYz4ucQnaQGg8PIA0k";
var markers = [];
var markers_bunkry = [];

const map = L.map("map").setView([50.0956928, 16.7678179], 13);
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

L.control.layers(tileLayers).addTo(map);

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
  if (activeBase == "Mapy.com" || activeBase == "Satellite Mapy.com") {
    mapy_com_icon.addTo(map);
  } else {
    map.removeControl(mapy_com_icon);
  }
}

map_com_icon();

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

    markers.forEach((r) => {
      r.remove();
    });
    markers = [];

    data.ropiky.forEach((r) => {
      const id = r[0];
      const ropiky_id = r[1];
      const vz36 = r[2];
      const name = r[3];
      const sbor = r[4];
      const úsek = r[5];
      const řop = r[6];
      const typ = r[7];
      const odolnost = r[8];
      const mnm = r[9];
      const betonáž = r[10];
      const krychelná = r[11];
      const stav_1938 = r[12];
      const stav_dnes = r[13];
      const lat = r[14];
      const lng = r[15];
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
            website: "https://ropiky.net/dbase_objekt.php?id=" + ropiky_id,
          },
        });
        window.dispatchEvent(ropikyEvent);
      });
      markers.push(marker);
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
      const op_id = r[1];
      const name = r[2];
      const secret_name = r[3];
      const website = r[4];
      const state = r[5];
      const museum = r[6];
      const lat = r[7];
      const lng = r[8];

      if (state == "postaven") {
        var marker = L.marker([lat, lng], { icon: bunkrIcon });
      } else {
        var marker = L.marker([lat, lng], { icon: bunkrIcon_not });
      }
      marker.addTo(map);
      marker.on("click", function (e) {
        const bunkryEvent = new CustomEvent("OnBunkryClickEvent", {
          detail: {
            id: op_id,
            name: name,
            secret_name: secret_name,
            website: website,
            state: state,
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

map.on("moveend", function (e) {
  if (map.getZoom() > 13) {
    getRopiky();
  }
  if (map.getZoom() > 11) {
    getBunkry();
  }
});

window.addEventListener("map_resize_leaf", function (e) {
  setTimeout(() => {
    map.invalidateSize();
  }, 200);
});

setTimeout(() => {
  window.exportedMap = map;
}, 100);
