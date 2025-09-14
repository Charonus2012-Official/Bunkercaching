// Settings
const GEODATA = "../data/geodata"; // NO SLASH AT THE END

const ropikyZoomLevel = 10;
const bunkryZoomLevel = 8;

const MAPY_COM_API_KEY = 'Vtuv43i3ze9T5MzXJC-eWCNRSDYz4ucQnaQGg8PIA0k';
var markers = []
var markers_bunkry = []



const map = L.map('map').setView([50.0956928, 16.7678179], 13);
const tileLayers = {
    'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 3,
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    'OpenTopoMap': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        minZoom: 3,
        maxZoom: 16,
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
    }),
    'Mapy.com': L.tileLayer(`https://api.mapy.com/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${MAPY_COM_API_KEY}`, {
        minZoom: 3,
        maxZoom: 19,
        attribution: '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    }),
    'Satellite Mapy.com': L.tileLayer(`https://api.mapy.com/v1/maptiles/aerial/256/{z}/{x}/{y}?apikey=${MAPY_COM_API_KEY}`, {
        minZoom: 3,
        maxZoom: 19,
        attribution: '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    }),

};


tileLayers['OpenStreetMap'].addTo(map);

L.control.layers(tileLayers).addTo(map);




const LogoControl = L.Control.extend({
    options: {
        position: 'bottomleft',
    },

    onAdd: function (map) {
        const container = L.DomUtil.create('div');
        const link = L.DomUtil.create('a', '', container);

        link.setAttribute('href', 'http://mapy.com/');
        link.setAttribute('target', '_blank');
        link.innerHTML = '<img src="https://api.mapy.com/img/api/logo.svg" />';
        L.DomEvent.disableClickPropagation(link);

        return container;
    },
});


let mapy_com_icon = new LogoControl()


async function map_com_icon(activeBase) {
    if (activeBase == "Mapy.com" || activeBase == "Satellite Mapy.com") {
        mapy_com_icon.addTo(map);
    } else {
        map.removeControl(mapy_com_icon)
    }
}

map_com_icon();

map.on('baselayerchange', function(e) {
    map_com_icon(e.name);
});

var ropikIcon = L.icon({
    iconUrl: '../data/images/ropik.png',   // obrázek (může být i URL)
    iconSize: [32, 32],      // velikost obrázku
    iconAnchor: [16, 32],    // kotva (střed ikony)
    popupAnchor: [0, -16]    // kde se otevře popup
});

var bunkrIcon = L.icon({
    iconUrl: '../data/images/bunkr.png',   // obrázek (může být i URL)
    iconSize: [32, 32],      // velikost obrázku
    iconAnchor: [16, 32],    // kotva (střed ikony)
    popupAnchor: [0, -16]    // kde se otevře popup
});

async function getRopiky() {
    var bounds = map.getBounds();
    var topLeft = bounds.getNorthWest();
    var bottomRight = bounds.getSouthEast();

    lat_one = topLeft.lat
    lng_one = topLeft.lng
    lat_two = bottomRight.lat
    lng_two = bottomRight.lng

    const url = `http://127.0.0.1:8000/ropiky?lat_one=${lat_one}&lng_one=${lng_one}&lat_two=${lat_two}&lng_two=${lng_two}`;
    try {
        const response = await fetch(url, {method: "GET"});
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        const data = await response.json();

        markers.forEach(r => {
            r.remove();
        });
        markers = [];


        data.ropiky.forEach(r => {
            const id = r[0]
            const name = r[1]
            const website = r[2];
            const museum = r[3];
            const lat = r[4];
            const lng = r[5];

            const marker = L.marker([lat, lng], {icon: ropikIcon});
            marker.addTo(map);
            marker.on("click", function(e) {

                const ropikyEvent = new CustomEvent("OnRopikyClickEvent", { detail: {
                    name: name,
                    website: website
                }});
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

    lat_one = topLeft.lat
    lng_one = topLeft.lng
    lat_two = bottomRight.lat
    lng_two = bottomRight.lng

    const url = `http://127.0.0.1:8000/bunkry?lat_one=${lat_one}&lng_one=${lng_one}&lat_two=${lat_two}&lng_two=${lng_two}`;
    try {
        const response = await fetch(url, {method: "GET"});
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        const data = await response.json();

        markers_bunkry.forEach(r => {
            r.remove();
        });
        markers_bunkry = [];


        data.bunkry.forEach(r => {
            const id = r[0]
            const op_id = r[1]
            const name = r[2]
            const secret_name = r[3]
            const website = r[4];
            const museum = r[5];
            const lat = r[6];
            const lng = r[7];

            const marker = L.marker([lat, lng], {icon: bunkrIcon});
            marker.addTo(map);
            marker.on("click", function(e) {
                const bunkryEvent = new CustomEvent("OnBunkryClickEvent", { detail: {
                        name: name,
                        secret_name: secret_name,
                        website: website
                    }});
                window.dispatchEvent(bunkryEvent);
            });
            markers_bunkry.push(marker);
        });

    } catch (err) {
        console.error("Fetch error:", err);
    }
}

map.on("moveend", function(e) {
    if (map.getZoom() > 13) {
        getRopiky()
    }
    if (map.getZoom() > 11) {
        getBunkry()
    }

});

window.addEventListener("map_resize_leaf", function(e) {
    setTimeout(() => {
        map.invalidateSize();
    }, 200);
});

setTimeout(() => {
    window.exportedMap = map;
}, 100);