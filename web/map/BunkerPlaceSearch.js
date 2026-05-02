class BunkerPlaceSearch {
    constructor(map) {
        this.map = map;
        this.container = document.getElementById('searchContainer');
        this.toggleBtn = document.getElementById('searchToggle');
        this.searchInput = document.getElementById('searchInput');
        this.resultsDiv = document.getElementById('searchResults');
        this.setupEventListeners()
    }
    setupEventListeners() {
        // Toggle search visibility on mobile
        this.toggleBtn.addEventListener('click', () => {
            this.container.classList.toggle('expanded');
            if (this.container.classList.contains('expanded')) {
                this.searchInput.focus();
            }
        });

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

    async searchBunkers(query) {
        if (!query || query.length < 2) return [];

        try {
            const response = await fetch(`/api/search?prompt=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.output) {
                return data.output.map(item => ({
                    display_name: `${item.type}: ${item.name}`,
                    lat: item.lat,
                    lon: item.lon
                }));
            }
            return [];
        } catch (error) {
            console.error("Error searching bunkers:", error);
            return [];
        }
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
        const self = this;
        for (const result of results) {
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);
            const button = document.createElement("button");
            button.className = "searchResult";
            button.textContent = result.display_name;

            button.onclick = function () {
                window.exportedMap.setView([lat, lon], 17);

                document.getElementById('searchResults').innerHTML = '';
                document.getElementById('searchInput').value = '';
                
                // Collapse search container on mobile after selection
                self.container.classList.remove('expanded');
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
