// Settings
const COMMON = "../common"; // NO SLASH AT THE END

const ropikyZoomLevel = 12;
const bunkryZoomLevel = 10;

const MAPY_COM_API_KEY = 'Vtuv43i3ze9T5MzXJC-eWCNRSDYz4ucQnaQGg8PIA0k';



const map = L.map('map').setView([50.0956928, 16.7678179], 13);
const tileLayers = {
    'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 8,
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }),
    'OpenTopoMap': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        minZoom: 8,
        maxZoom: 16,
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)',
    }),
    'Mapy.com': L.tileLayer(`https://api.mapy.com/v1/maptiles/outdoor/256/{z}/{x}/{y}?apikey=${MAPY_COM_API_KEY}`, {
        minZoom: 8,
        maxZoom: 19,
        attribution: '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    }),
    'Satellite Mapy.com': L.tileLayer(`https://api.mapy.com/v1/maptiles/aerial/256/{z}/{x}/{y}?apikey=${MAPY_COM_API_KEY}`, {
        minZoom: 8,
        maxZoom: 19,
        attribution: '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    }),

};


tileLayers['OpenStreetMap'].addTo(map);

L.control.layers(tileLayers).addTo(map);




let ropikyLayer = null;
let loaded = false;

async function loadRopikyLayer() {
    const response = await fetch(`${COMMON}/bunkers/ropiky.geojson`);
    const data = await response.json();
    ropikyLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: 3, color: 'red' }),
        onEachFeature: (feature, layer) => {
            layer.on("click", function (e) {
                const event = new CustomEvent("OnRopikyClickEvent", { detail: feature });
                window.dispatchEvent(event);
            });
        }
    });
    if (map.getZoom() >= ropikyZoomLevel) map.addLayer(ropikyLayer);
}

async function loadBunkryLayer() {
    const response = await fetch(`${COMMON}/bunkers/bunkry.geojson`);
    const data = await response.json();
    bunkryLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: 5, color: 'blue' }),
        onEachFeature: (feature, layer) => {
            layer.on("click", function (e) {
                const event = new CustomEvent("OnBunkryClickEvent", { detail: feature });
                window.dispatchEvent(event);
            });
        }
    });
    if (map.getZoom() >= bunkryZoomLevel) map.addLayer(bunkryLayer);
}

loadBunkryLayer();
loadRopikyLayer();

// Při změně zoomu přidá/odebere vrstvy
map.on("zoomend", () => {
    const zoom = map.getZoom();
    console.log("Zoom level:", zoom);

    if (zoom >= ropikyZoomLevel) {
        if (ropikyLayer && !map.hasLayer(ropikyLayer)) {
            map.addLayer(ropikyLayer);
        }
    } else {
        if (ropikyLayer && map.hasLayer(ropikyLayer)) {
            map.removeLayer(ropikyLayer);
        }
    }
    if (zoom >= bunkryZoomLevel) {
        if (bunkryLayer && !map.hasLayer(bunkryLayer)) {
            map.addLayer(bunkryLayer);
        }
    } else {
        if (bunkryLayer && map.hasLayer(bunkryLayer)) {
            map.removeLayer(bunkryLayer);
        }
    }
});


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
    console.log('Přepnuto na vrstvu:', e.name);
    map_com_icon(e.name);
});

