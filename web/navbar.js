window.addEventListener("load", function () {
  const currentPath = window.location.pathname;
  const logoPath = "/data/logo/bunkercaching_pure_logo.png";

  const navbarInner = `
    <div class="logo">
      <a href="/">
        <img src="${logoPath}" alt="Bunkercaching">
      </a>
    </div>
    <ul id="menu">
      <li><a href="/map" class="${currentPath.startsWith("/map") ? "active" : ""}">Mapa</a></li>
      <li><a href="/logs" class="${currentPath.startsWith("/logs") ? "active" : ""}">Logy</a></li>
      <li><a href="/about" class="${currentPath.startsWith("/about") ? "active" : ""}">O projektu</a></li>
      <li><a href="/auth" id="nav-profile" class="${currentPath.startsWith("/auth") ? "active" : ""}">Přihlášení</a></li>
    </ul>
    <div class="menu-toggle" id="mobile-toggle">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  const navbar = document.getElementById("navbar");
  navbar.innerHTML = navbarInner;

  const prof = document.getElementById("nav-profile");
  const toggle = document.getElementById("mobile-toggle");
  const menu = document.getElementById("menu");

  toggle.addEventListener("click", () => {
    menu.classList.toggle("show");
    toggle.classList.toggle("active");
  });

  fetch("/api/me", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        return { username: "Přihlášení" };
      }
      return response.json();
    })
    .then((data) => {
      if (data.username) {
        prof.textContent = data.username;
      }
    });
});
