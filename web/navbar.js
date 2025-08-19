window.onload = function() {
    navbar_inner = '<div class="logo"><a href="/"><img id="nicn" src="../data/logo/bunkercaching_pure_logo.png" alt="Bunkercaching" height="40"></a></div><ul id="menu"><li><a href="/map">Mapa</a></li><li><a href="/about">O projektu</a></li><li ><a href="/auth" id="nav-profile">Přihlášení</a></li></ul><div class="menu-toggle" onclick="toggleMenu()"><span></span><span></span><span></span></div>'
    navbar = document.getElementById("navbar");
    navbar.innerHTML = navbar_inner;
    const prof = document.getElementById("nav-profile");
    fetch("http://127.0.0.1:8000/me", {
        method: "POST",
        credentials: "include" // důležité pro poslání cookie
    })
        .then(response => {
            if (!response.ok) {
                return {"username": "Přihlášení"};
            }
            return response.json()
        })
        .then(data => {
            prof.textContent = data.username
        });

    
};




function toggleMenu() {
    document.getElementById("menu").classList.toggle("show");
}