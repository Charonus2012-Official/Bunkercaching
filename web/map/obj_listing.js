window.addEventListener("OnRopikyClickEvent", (e) => {
    const data = e.detail;
    const bunker_name = document.getElementById("bunker-name")
    document.getElementById("secret-bunker-name").textContent = "";
    const bunker_site = document.getElementById("bunker-site")
    const sidebottom = document.getElementById("sidebottom");
    const bunker_form_id = document.getElementById("bunker_id")
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
    if (data.properties.name === bunker_name.textContent) return;

    bunker_name.textContent = data.properties.name;
    secret_bunker_name.textContent = data.properties.secret_name;
    bunker_site.setAttribute("href", data.properties.website);
    bunker_site.textContent = "Více na: opevneni.cz";
    bunker_site.style.display = "block";
    sidebottom.style.display = "inline";
    bunker_form_id.setAttribute("value", data.properties.name)

});