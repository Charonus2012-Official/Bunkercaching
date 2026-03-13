window.addEventListener("OnRopikyClickEvent", (e) => {
    const data = e.detail;
    const screenWidth = window.innerWidth;
    const sidebar = document.getElementById("sidebar")
    const sidetop = document.getElementById("sidetop")

    if (screenWidth < 729) {
        const map = document.getElementById("map");
        map.style.display = "none";
    }

    sidebar.style.display = "flex";

    sidetop.innerHTML = ""

    const bunker_name = document.createElement("h2")
    const type = document.createElement("h4")
    const bunker_site = document.createElement("a")
    const state = document.createElement("p")
    const odolnost = document.createElement("p")
    const sbor = document.createElement("p")
    const usek = document.createElement("p")

    bunker_name.className = "center";
    type.className = "center"
    sbor.className = "center"
    usek.className = "center"
    odolnost.className = "center"
    bunker_site.className = "center mlink";
    state.className = "center";

    sidetop.appendChild(bunker_name);
    sidetop.appendChild(type);
    sidetop.appendChild(sbor);
    sidetop.appendChild(usek);
    sidetop.appendChild(odolnost);
    sidetop.appendChild(state);
    sidetop.appendChild(bunker_site);

    const bunker_form_id = document.getElementById("bunker_id");
    const bunker_type = document.getElementById("bunker_type");




    if (data.name === bunker_name.textContent) return;
    bunker_name.textContent = data.name;

    sbor.textContent = data.sbor;

    usek.textContent = data.úsek;

    type.textContent = "LO vz. " + (data.vz36 === 1 ? "36" : "37") + " " + data.typ;
    if (data.odolnost !== "") {
        odolnost.textContent = "Odolnost: " + data.odolnost;
    }
    state.textContent = "Stav objektu: " + data.stav_dnes.charAt(0).toUpperCase() + data.stav_dnes.slice(1);


    bunker_site.setAttribute("href", data.website);
    bunker_site.textContent = "Více na: ropiky.net";
    bunker_site.style.display = "block";


    const sidebottom = document.getElementById("sidebottom");
    sidebottom.style.display = "inline";
    bunker_form_id.setAttribute("value", data.id);
    bunker_type.setAttribute("value", "lo");



});

window.addEventListener("OnBunkryClickEvent", (e) => {
    const data = e.detail;

    const screenWidth = window.innerWidth;

    const sidebar = document.getElementById("sidebar")
    const sidebottom = document.getElementById("sidebottom");
    const sidetop = document.getElementById("sidetop");


    if (screenWidth < 729) {
        const map = document.getElementById("map");
        map.style.display = "none";
    }

    sidetop.innerHTML = "";

    const bunker_name = document.createElement("h1")
    const secret_bunker_name = document.createElement("h2")
    const state = document.createElement("p")
    const bunker_site = document.createElement("a")

    bunker_name.className = "center";
    secret_bunker_name.className = "center";
    state.className = "center";
    bunker_site.className = "center mlink";

    sidetop.appendChild(bunker_name);
    sidetop.appendChild(secret_bunker_name);
    sidetop.appendChild(state);
    sidetop.appendChild(bunker_site);

    const bunker_type = document.getElementById("bunker_type");
    const bunker_form_id = document.getElementById("bunker_id")

    sidebar.style.display = "flex";
    if (data.name === bunker_name.textContent) return;

    state.textContent = displ(data.state);
    bunker_name.textContent = data.name;
    secret_bunker_name.textContent = data.secret_name;
    bunker_site.setAttribute("href", data.website);
    bunker_site.textContent = "Více na: opevneni.cz";
    bunker_site.style.display = "block";
    sidebottom.style.display = "inline";
    bunker_form_id.setAttribute("value", data.id);
    bunker_type.setAttribute("value", "to");

});

function displ(state) {
    if (state === "") {
        return "Stav: Neznámý"
    } else {
        return "Stav objektu: " + state.charAt(0).toUpperCase() + state.slice(1);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.getElementById("sidebar");
    const map = document.getElementById("map");
    const closeBtn = document.getElementById("close");

    closeBtn.addEventListener("click", () => {
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