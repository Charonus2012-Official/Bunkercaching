class BunkerPlaceSearch {
    constructor(map) {
        this.map = map;
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
        const q = query.toUpperCase();

        if (!feature) return [];

        const coords = feature.geometry?.coordinates || [];
        return [{
            display_name: "Bunkr: " + feature.properties?.name + ' "' + feature.properties?.secret_name.slice(1) + '"' || "",
            lon: coords[0] || null,
            lat: coords[1] || null
        }];
    }

    async searchPlaces(query) {

        const params = new URLSearchParams({
            format: 'json',
            q: query,
            limit: 4,
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
async function loadSearch() {
    setTimeout(function() {
        let search = new BunkerPlaceSearch(window.exportedMap)
    }, 200);
}
loadSearch();
