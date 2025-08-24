class BunkerPlaceSearch {
    constructor(map, bunkerData) {
        this.map = map;
        this.bunkerData = bunkerData;
        this.searchInput = document.getElementById('searchInput');
        this.resultsDiv = document.getElementById('searchResults');
        this.setupEventListeners()
    }
    setupEventListeners() {
        // Hledá výstup po 300ms neaktivnosti
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.search(e.target.value);
            }, 300);
        });
    }

    async search(query) {
        const [bunkers, places] = await Promise.all([
            this.searchBunkers(query),
            this.searchPlaces(query)
        ]);

        this.displayResults([...bunkers, ...places]);
    }

    searchBunkers(query) {
        return [];
    }

    async searchPlaces(query) {

        const params = new URLSearchParams({
            format: 'json',
            q: query,
            limit: 3,
            countrycodes: 'cz',
            'accept-language': 'cs,en'
        });
        const url = `https://nominatim.openstreetmap.org/search?${params}`

        const response = await fetch(url);
        let results;
        results = await response.json();

        return results;
    }

    displayResults(results) {
        this.resultsDiv.innerHTML = '';
        for (const result of results) {
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);
            const button = document.createElement("button");
            button.className = "searchResult";
            button.textContent = result.display_name;

            button.onclick = function () {
                window.exportedMap.setView([lat, lon], 13);

                document.getElementById('searchResults').innerHTML = '';
                document.getElementById('searchInput').value = '';
            }


            this.resultsDiv.appendChild(button);
        }
    }
}

let bd;
fetch('../data/geodata/bunkry.geojson')
    .then(response => response.json())
    .then(data => bd = data.features);

setTimeout(() => {
    let search = new BunkerPlaceSearch(window.exportedMap, bd);
}, 200);