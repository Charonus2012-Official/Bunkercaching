window.addEventListener("OnRopikyClickEvent", (e) => {
    const data = e.detail;
    const bunker_name = document.getElementById("secret-bunker-name")
    document.getElementById("bunker-name").textContent = "";
    const bunker_site = document.getElementById("bunker-site")
    const sidebottom = document.getElementById("sidebottom");
    const bunker_form_id = document.getElementById("bunker_id")
    const sidebar = document.getElementById("sidebar")
    const screenWidth = window.innerWidth;
    if (screenWidth < 729) {
        const map = document.getElementById("map");
        map.style.display = "none";
    }
    sidebar.style.display = "flex";
    if (data.properties.name === bunker_name.textContent) return;

    bunker_name.textContent = data.properties.name;
    bunker_site.setAttribute("href", data.properties.website);
    bunker_site.textContent = "Více na: ropiky.cz";
    bunker_site.style.display = "block";
    sidebottom.style.display = "inline";
    bunker_form_id.setAttribute("value", data.properties.name)



});

window.addEventListener("OnBunkryClickEvent", (e) => {
    const data = e.detail;
    const bunker_name = document.getElementById("bunker-name");
    const secret_bunker_name = document.getElementById("secret-bunker-name");
    const bunker_site = document.getElementById("bunker-site")
    const sidebottom = document.getElementById("sidebottom");
    const bunker_form_id = document.getElementById("bunker_id")
    const sidebar = document.getElementById("sidebar")
    const screenWidth = window.innerWidth;
    if (screenWidth < 729) {
        const map = document.getElementById("map");
        map.style.display = "none";
    }
    sidebar.style.display = "flex";
    if (data.properties.name === bunker_name.textContent) return;

    bunker_name.textContent = data.properties.name;
    secret_bunker_name.textContent = data.properties.secret_name;
    bunker_site.setAttribute("href", data.properties.website);
    bunker_site.textContent = "Více na: opevneni.cz";
    bunker_site.style.display = "block";
    sidebottom.style.display = "inline";
    bunker_form_id.setAttribute("value", data.properties.name)

});

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
    });
});