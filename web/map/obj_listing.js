function toDMM(decimal, isLat) {
    const dir = isLat ? (decimal >= 0 ? 'N' : 'S') : (decimal >= 0 ? 'E' : 'W');
    const abs = Math.abs(decimal);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(3);
    const degStr = isLat ? deg : String(deg).padStart(3, '0');
    return [dir, degStr, min];
}

function coordsElement(lat, lng) {
    const coordsDiv = document.createElement('div');
    coordsDiv.className = 'coords'

    Dlat = toDMM(lat, true)
    Dlng = toDMM(lng, false)

    coordsDiv.innerHTML = `
      <span class="coord">
        <span class="dir">${Dlat[0]}</span> ${Dlat[1]}° ${Dlat[2]}′
      </span>
      <span class="coord">
        <span class="dir">${Dlng[0]}</span> ${Dlng[1]}° ${Dlng[2]}′
      </span>
    `;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.title = 'Kopírovat souřadnice';
    copyBtn.textContent = '⧉';

    copyBtn.addEventListener('click', () => {
        const text = `${Dlat[0]} ${Dlat[1]}° ${Dlat[2]}′ ${Dlng[0]} ${Dlng[1]}° ${Dlng[2]}′`;
        copyToClipboard(text, copyBtn);
    });

    coordsDiv.appendChild(copyBtn);


    return coordsDiv;
}

function copyToClipboard(text, btnEl) {
    const showFeedback = () => {
        const original = btnEl.textContent;
        btnEl.textContent = '✓';
        btnEl.classList.add('copied');
        setTimeout(() => {
            btnEl.textContent = original;
            btnEl.classList.remove('copied');
        }, 1200);
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(showFeedback).catch(() => {
            fallbackCopy(text, showFeedback);
        });
    } else {
        fallbackCopy(text, showFeedback);
    }
}

function fallbackCopy(text, onSuccess) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
        onSuccess();
    } catch (err) {
        console.error('Copy failed:', err);
    }
    document.body.removeChild(textarea);
}


function createMapLinks(lat, lng, fortificationName) {
    const container = document.createElement('div');
    container.className = 'map-links';

    // Google Maps link
    const googleLink = document.createElement('a');
    googleLink.href = `https://www.google.com/maps/search/${lat},${lng}`;
    googleLink.textContent = '🗺️ Google Maps';
    googleLink.target = '_blank';
    googleLink.rel = 'noopener noreferrer';
    googleLink.className = 'map-link';

    // Mapy.com link
    const mapyLink = document.createElement('a');
    mapyLink.href = `https://mapy.com/fnc/v1/showmap?center=${lng},${lat}&marker=true&zoom=18`;
    mapyLink.textContent = '📍 Mapy.com';
    mapyLink.target = '_blank';
    mapyLink.rel = 'noopener noreferrer';
    mapyLink.className = 'map-link';

    container.appendChild(mapyLink);
    container.appendChild(googleLink);

    return container;
}

window.addEventListener("OnRopikyClickEvent", (e) => {
    const data = e.detail;
    const screenWidth = window.innerWidth;
    const sidebar = document.getElementById("sidebar");
    const sidetop = document.getElementById("sidetop");

    if (screenWidth < 729) {
        const map = document.getElementById("map");
        map.style.display = "none";
    }

    sidebar.style.display = "flex";

    sidetop.innerHTML = "";

    const bunker_name = document.createElement("h2");
    bunker_name.textContent = data.name;
    sidetop.appendChild(bunker_name);

    const type = document.createElement("h4");
    type.textContent = "LO vz. " + (data.vz36 === 1 ? "36" : "37") + " " + data.typ;
    sidetop.appendChild(type);

    function addDetail(label, value) {
        if (!value || value === "") return;
        const row = document.createElement("div");
        row.className = "detail-row";
        if (label === "Objekty" && Array.isArray(value)) {
            row.innerHTML = `<span class="detail-label">${label}</span><span class="detail-value">${value.join("<br>")}</span>`;
        } else {
            row.innerHTML = `<span class="detail-label">${label}</span><span class="detail-value">${value}</span>`;
        }
        sidetop.appendChild(row);
    }

    addDetail("Sbor", data.sbor);
    addDetail("Úsek", data.úsek);
    addDetail("Odolnost", data.odolnost);
    addDetail("Nadmořská výška", data.mnm.toString() + " m. n. m.");
    addDetail("Stav objektu 1938/Dnes", data.stav_1938.charAt(0).toUpperCase() + data.stav_1938.slice(1) + "/" + data.stav_dnes.charAt(0).toUpperCase() + data.stav_dnes.slice(1));
    sidetop.appendChild(
        coordsElement(data.lat, data.lng)
    );
    sidetop.appendChild(
        createMapLinks(data.lat, data.lng, data.name)
    )

    const bunker_site = document.createElement("a");
    bunker_site.className = "center mlink";
    bunker_site.setAttribute("href", data.website);
    bunker_site.textContent = "Více na: ropiky.net";
    bunker_site.style.display = "block";
    bunker_site.addEventListener("click", (e) => {
        e.preventDefault();
        window.open(
            bunker_site.getAttribute("href"),
            "popup",
            "width=1200;height=600",
        );
    });
    sidetop.appendChild(bunker_site);

    const bunker_form_id = document.getElementById("bunker_id");
    const bunker_type = document.getElementById("bunker_type");
    const sidebottom = document.getElementById("sidebottom");

    sidebottom.style.display = "block";
    bunker_form_id.setAttribute("value", data.id);
    bunker_type.setAttribute("value", "lo");

    const submitBtn = sidebottom.querySelector('input[type="submit"]');
    if (window.logging_deactivated) {
        submitBtn.disabled = true;
    } else {
        submitBtn.disabled = false;
    }
});

window.addEventListener("OnBunkryClickEvent", (e) => {
    const data = e.detail;
    const screenWidth = window.innerWidth;
    const sidebar = document.getElementById("sidebar");
    const sidetop = document.getElementById("sidetop");
    const sidebottom = document.getElementById("sidebottom");

    if (screenWidth < 729) {
        const map = document.getElementById("map");
        map.style.display = "none";
    }

    sidebar.style.display = "flex";
    sidetop.innerHTML = "";

    const bunker_name = document.createElement("h1");
    bunker_name.textContent = data.name;
    sidetop.appendChild(bunker_name);

    if (data.secret_name && data.secret_name !== "") {
        const secret_name = document.createElement("h2");
        secret_name.textContent = data.secret_name;
        sidetop.appendChild(secret_name);
    }

    function addDetail(label, value) {
        if (!value || value === "") return;
        const row = document.createElement("div");
        row.className = "detail-row";
        if (label === "Objekty" && Array.isArray(value)) {
            row.innerHTML = `<span class="detail-label">${label}</span><span class="detail-value">${value.join("<br>")}</span>`;
        } else {
            row.innerHTML = `<span class="detail-label">${label}</span><span class="detail-value">${value}</span>`;
        }
        sidetop.appendChild(row);
    }

    function capitalizeFirstLetter(string) {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    addDetail("Stav objektu", data.stav);
    addDetail("Úsek", data.usek);
    addDetail("Podúsek", data.podusek);
    addDetail("Typ", data.typ);
    addDetail("Odolnost", data.odolnost);
    addDetail("Tvrz", capitalizeFirstLetter(data.tvrz));
    addDetail("N. m. výška", (data.nm_vyska != "" ? data.nm_vyska : "?") + " m. n. m.");
    addDetail("Osádka", data.osadka + " Lidí");
    addDetail("Betonáž", capitalizeFirstLetter(data.betonaz));
    addDetail("Studna", capitalizeFirstLetter(data.studna));
    addDetail("Výkres", data.vykres);
    addDetail("Firma", data.firma);
    sidetop.appendChild(
        coordsElement(data.lat, data.lng)
    );
    sidetop.appendChild(
        createMapLinks(data.lat, data.lng, data.name)
    )

    const bunker_site = document.createElement("a");
    bunker_site.className = "center mlink";
    bunker_site.setAttribute("href", data.website);
    bunker_site.textContent = "Více na: opevneni.cz";
    bunker_site.style.display = "block";
    bunker_site.addEventListener("click", (e) => {
        e.preventDefault();
        window.open(
            bunker_site.getAttribute("href"),
            "popup",
            "width=1200;height=600",
        );
    });
    sidetop.appendChild(bunker_site);

    const bunker_form_id = document.getElementById("bunker_id");
    const bunker_type = document.getElementById("bunker_type");

    sidebottom.style.display = "block";
    bunker_form_id.setAttribute("value", data.id);
    bunker_type.setAttribute("value", "to");

    const submitBtn = sidebottom.querySelector('input[type="submit"]');
    if (window.logging_deactivated) {
        submitBtn.disabled = true;
    } else {
        submitBtn.disabled = false;
    }
});

window.addEventListener("OnTvrzeClickEvent", async (e) => {
    const data = e.detail;
    const screenWidth = window.innerWidth;
    const sidebar = document.getElementById("sidebar");
    const sidetop = document.getElementById("sidetop");
    const sidebottom = document.getElementById("sidebottom");

    if (screenWidth < 729) {
        const map = document.getElementById("map");
        map.style.display = "none";
    }

    sidebar.style.display = "flex";
    sidetop.innerHTML = "";

    const bunker_name = document.createElement("h1");
    bunker_name.textContent = data.name + " — " + data.shortcut;
    sidetop.appendChild(bunker_name);

    function addDetail(label, value) {
        if (!value || value === "") return;
        const row = document.createElement("div");
        row.className = "detail-row";
        if (label === "Objekty" && Array.isArray(value)) {
            row.innerHTML = `<span class="detail-label">${label}</span><span class="detail-value">${value.join("<br>")}</span>`;
        } else {
            row.innerHTML = `<span class="detail-label">${label}</span><span class="detail-value">${value}</span>`;
        }
        sidetop.appendChild(row);
    }

    function capitalizeFirstLetter(string) {
        if (!string) return string;
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    let full = [];

    try {
        const objects = Array.isArray(data.objects) ? data.objects : [];
        const hasRawBunkers = objects.length > 0 && Array.isArray(objects[0]);

        if (hasRawBunkers) {
            full = objects.map((bunker) => {
                const name = (bunker[3] && bunker[3] !== " ") ? bunker[2] + " — " + bunker[3] : bunker[2];
                const stav = bunker[5];
                return { name, stav, raw: bunker };
            });
        } else {
            const fetchPromises = objects.map(async (object) => {
                const url = `/api/id?id=${object}&type=to`;
                const response = await fetch(url, { method: "GET" });
                if (!response.ok) {
                    throw new Error("HTTP error " + response.status);
                }
                const result = await response.json();
                const bunker = result.output;
                const name = (bunker[3] && bunker[3] !== " ") ? bunker[2] + " — " + bunker[3] : bunker[2];
                const stav = bunker[5];
                return { name, stav, raw: bunker };
            });

            full = await Promise.all(fetchPromises);
        }
    } catch (err) {
        console.error("Error fetching objects:", err);
        const objects = Array.isArray(data.objects) ? data.objects : [];
        full = objects.map((object) => ({
            name: Array.isArray(object) ? ((object[3] && object[3] !== " ") ? object[2] + " — " + object[3] : object[2]) : object,
            stav: Array.isArray(object) ? object[5] : "unknown",
            raw: Array.isArray(object) ? object : null
        }));
    }

    addDetail("Stav", data.stav);
    addDetail("Úsek", data.usek);
    addDetail("Podúsek", data.podusek);
    
    if (full.length > 0) {
        const row = document.createElement("div");
        row.className = "detail-row";
        const label = document.createElement("span");
        label.className = "detail-label";
        label.textContent = "Objekty";
        row.appendChild(label);
        
        const valueSpan = document.createElement("span");
        valueSpan.className = "detail-value";
        
        full.forEach((obj, index) => {
            const objSpan = document.createElement("span");
            objSpan.textContent = obj.name;
            objSpan.style.textDecoration = "underline";
            objSpan.style.cursor = "pointer";
            
            if (obj.stav === "Postaven") {
                objSpan.style.color = "#4CAF50";
            } else {
                objSpan.style.color = "#ff1e1c";
            }

            objSpan.addEventListener("click", () => {
                if (obj.raw) {
                    const bunker = obj.raw;
                    const event = new CustomEvent("OnBunkryClickEvent", {
                        detail: {
                            id: bunker[1],
                            name: bunker[2],
                            secret_name: bunker[3],
                            website: bunker[4],
                            stav: bunker[5],
                            usek: bunker[6],
                            podusek: bunker[7],
                            typ: bunker[8],
                            odolnost: bunker[9],
                            tvrz: bunker[10],
                            nm_vyska: bunker[18],
                            osadka: bunker[19],
                            betonaz: bunker[25],
                            studna: bunker[23],
                            vykres: bunker[24],
                            firma: bunker[26],
                        }
                    });
                    window.dispatchEvent(event);

                    if (window.exportedMap && bunker[27] && bunker[28]) {
                        window.exportedMap.setView([bunker[27], bunker[28]], 16);
                    }
                }
            });

            valueSpan.appendChild(objSpan);
            if (index < full.length - 1) {
                valueSpan.appendChild(document.createElement("br"));
            }
        });
        row.appendChild(valueSpan);
        sidetop.appendChild(row);
    }

    addDetail("Postavené/Všechny objekty", data.postavene_objekty + "/" + data.pocet_objektu);
    addDetail("Řešení Vstupního Obj.", capitalizeFirstLetter(data.reseni_vo));
    addDetail("Osádka", data.osadka + " Lidí");
    addDetail("Jiné názvy", data.jine_nazvy);

    const bunker_site = document.createElement("a");
    bunker_site.className = "center mlink";
    bunker_site.setAttribute("href", data.website);
    bunker_site.textContent = "Více na: opevneni.cz";
    bunker_site.style.display = "block";
    bunker_site.addEventListener("click", (e) => {
        e.preventDefault();
        window.open(
            bunker_site.getAttribute("href"),
            "popup",
            "width=1200;height=600",
        );
    });
    sidetop.appendChild(bunker_site);

    const bunker_form_id = document.getElementById("bunker_id");
    const bunker_type = document.getElementById("bunker_type");

    sidebottom.style.display = "none";
    bunker_form_id.setAttribute("value", data.id);
    bunker_type.setAttribute("value", "tvrz");

    const submitBtn = sidebottom.querySelector('input[type="submit"]');
    submitBtn.disabled = true;
});

function displ(state) {
    if (state === "") {
        return "Stav: Neznámý";
    } else {
        return (
            "Stav objektu: " + state.charAt(0).toUpperCase() + state.slice(1)
        );
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const map = document.getElementById("map");
    const closeBtn = document.getElementById("close");

    closeBtn.addEventListener("click", (e) => {
        L.DomEvent.stopPropagation(e);
        // Skrýt sidebar a roztáhnout mapu
        sidebar.style.display = "none"; // nebo sidebar.style.width = "0";
        const screenWidth = window.innerWidth;
        if (screenWidth < 729) {
            const map = document.getElementById("map");
            map.style.display = "block";
        }
        const event = new CustomEvent("map_resize_leaf");
        window.dispatchEvent(event);
        document.getElementById("sidetop").innerHTML = "";
    });
});
