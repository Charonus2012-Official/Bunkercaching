window.addEventListener("OnRopikyClickEvent", (e) => {
    const data = e.detail;
    const bunker_name = document.getElementById("bunker-name")
    document.getElementById("secret-bunker-name").textContent = "";
    const bunker_site = document.getElementById("bunker-site")
    if (data.properties.name === bunker_name.textContent) return;

    bunker_name.textContent = data.properties.name;
    bunker_site.setAttribute("href", data.properties.website);
    bunker_site.textContent = "Více na: ropiky.cz";
    bunker_site.style.display = "block";



});

window.addEventListener("OnBunkryClickEvent", (e) => {
    const data = e.detail;
    const bunker_name = document.getElementById("bunker-name");
    const secret_bunker_name = document.getElementById("secret-bunker-name");
    const bunker_site = document.getElementById("bunker-site")
    if (data.properties.name === bunker_name.textContent) return;

    bunker_name.textContent = data.properties.name;
    secret_bunker_name.textContent = data.properties.secret_name;
    bunker_site.setAttribute("href", data.properties.website);
    bunker_site.textContent = "Více na: opevneni.cz";
    bunker_site.style.display = "block";

});


document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("logButton");
    const visited = button.classList.toggle("visited");
    button.addEventListener("click", () => {
        const visited = button.classList.toggle("visited");
    });
});