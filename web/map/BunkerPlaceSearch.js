class BunkerPlaceSearch {
    constructor(bunkerData) {
        // this.map = map;
        this.bunkerData = bunkerData;
        this.searchInput = document.getElementById('searchInput');
        this.resultsDiv = document.getElementById('searchResults');
        // this.setupEventListeners()
    }
    setupEventListeners() {
        // Hledá výstup po 300ms neaktivnosti
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.search(e.target.value);
            }, 300);
        });
        // Skryje výstup když klikne někde vedle
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideResults();
            }
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
            limit: 8,
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
        for (const result of results) {
            console.log(result.name)
        }
    }

    hideResults() {

    }
}

let search = new BunkerPlaceSearch({});
search.search("Praha");