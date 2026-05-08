class BunkerPlaceSearch extends L.Control {
    constructor(options) {
        super(options);
    }

    onAdd(map) {
        this._map = map;
        this._container = L.DomUtil.create('div', 'leaflet-control-search leaflet-bar leaflet-control');
        this._container.id = 'searchContainer';
        
        // Prevent map interaction when clicking on search
        L.DomEvent.disableClickPropagation(this._container);
        L.DomEvent.disableScrollPropagation(this._container);

        this._container.innerHTML = `
            <button id="searchToggle">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
            </button>
            <div id="searchWrapper">
                <input type="text" id="searchInput" placeholder="Hledej">
                <div id="searchResults"></div>
            </div>
        `;

        this.toggleBtn = this._container.querySelector('#searchToggle');
        this.searchInput = this._container.querySelector('#searchInput');
        this.resultsDiv = this._container.querySelector('#searchResults');

        this.setupEventListeners();

        return this._container;
    }

    setupEventListeners() {
        // Toggle search visibility
        this.toggleBtn.addEventListener('click', () => {
            this._container.classList.toggle('expanded');
            if (this._container.classList.contains('expanded')) {
                this.searchInput.focus();
            } else {
                this.searchInput.value = '';
                this.resultsDiv.innerHTML = '';
            }
        });

        // Hide search when clicking outside
        this._map.on('click', () => {
            this._container.classList.remove('expanded');
            this.searchInput.value = '';
            this.resultsDiv.innerHTML = '';
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
        if (!query || query.length < 3) return [];

        try {
            const response = await fetch(`/api/search?prompt=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.output) {
                // If the prompt is long enough, only show first 10-15 results to avoid clutter
                return data.output.slice(0, 15).map(item => ({
                    display_name: `${item.type}: ${item.name}`,
                    lat: item.lat,
                    lon: item.lon,
                    type: 'bunker'
                }));
            }
            return [];
        } catch (error) {
            console.error("Error searching bunkers:", error);
            return [];
        }
    }

    async searchPlaces(query) {
        if (!query || query.length < 3) return [];
        const params = new URLSearchParams({
            format: 'json',
            q: query,
            limit: 4,
            countrycodes: 'cz',
            'accept-language': 'cs,en'
        });
        const url = `https://nominatim.openstreetmap.org/search?${params}`

        try {
            const response = await fetch(url);
            const data = await response.json();
            return data.map(item => ({
                display_name: item.display_name,
                lat: item.lat,
                lon: item.lon,
                type: 'place'
            }));
        } catch (e) {
            console.error("Error searching places:", e);
            return [];
        }
    }

    displayResults(results) {
        this.resultsDiv.innerHTML = '';
        const self = this;
        
        if (results.length === 0 && this.searchInput.value.length >= 2) {
            const noResults = document.createElement("div");
            noResults.className = "searchResult no-results";
            noResults.textContent = "Žádné výsledky";
            noResults.style.padding = "8px";
            noResults.style.color = "#666";
            noResults.style.fontSize = "13px";
            this.resultsDiv.appendChild(noResults);
            return;
        }

        for (const result of results) {
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);
            const button = document.createElement("button");
            button.className = "searchResult";
            button.textContent = result.display_name;

            button.onclick = function () {
                self._map.setView([lat, lon], 17);

                self.resultsDiv.innerHTML = '';
                self.searchInput.value = '';
                
                // Collapse search container after selection
                self._container.classList.remove('expanded');

                // If it's a bunker/ropik, try to trigger click event to show details
                if (result.type === 'bunker') {
                    setTimeout(() => {
                        self._map.eachLayer((layer) => {
                            if (layer instanceof L.Marker && layer.getLatLng().lat === lat && layer.getLatLng().lng === lon) {
                                layer.fire('click');
                            }
                        });
                    }, 500);
                }
            }

            this.resultsDiv.appendChild(button);
        }
    }
}

/*
async function loadSearch() {
    // Wait for window.exportedMap to be available
    const checkMap = setInterval(() => {
        if (window.exportedMap) {
            clearInterval(checkMap);
            const searchControl = new BunkerPlaceSearch({ position: 'topright' });
            searchControl.addTo(window.exportedMap);
        }
    }, 100);
}
loadSearch();
*/
