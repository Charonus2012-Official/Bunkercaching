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
        row.innerHTML = `<span class="detail-label">${label}</span><span class="detail-value">${value}</span>`;
        sidetop.appendChild(row);
    }

    addDetail("Sbor", data.sbor);
    addDetail("Úsek", data.úsek);
    addDetail("Odolnost", data.odolnost);
    addDetail("Stav objektu", data.stav_dnes.charAt(0).toUpperCase() + data.stav_dnes.slice(1));

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
        row.innerHTML = `<span class="detail-label">${label}</span><span class="detail-value">${value}</span>`;
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
    addDetail("N. m. výška", data.nm_vyska + " m. n. m.");
    addDetail("Osádka", data.osadka + " Lidí");
    addDetail("Betonáž", data.betonaz);
    addDetail("Studna", capitalizeFirstLetter(data.studna));
    addDetail("Výkres", data.vykres);
    addDetail("Firma", data.firma);

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
