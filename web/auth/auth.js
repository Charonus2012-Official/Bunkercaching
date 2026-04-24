const link = "/api";

window.onload = function () {
  fetch(`${link}/me`, {
    method: "POST",
    credentials: "include", // důležité pro poslání cookie
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Nejste přihlášen");
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.username) {
        console.log("Přihlášen jako:", data.username);
        // If user is already logged in, redirect to home
        window.location.href = "/";
      }
    })
    .catch((err) => {
      console.log(err.message);
    });
};

document
  .getElementById("signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    const response = await fetch(`${link}/signup`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    const h2 = document.getElementById("err_signup");
    h2.setAttribute("class", result.type);
    if (result.type === "scs") {
      document.querySelectorAll(".signlog").forEach((el) => {
        el.value = "";
      });
    }
    h2.textContent = result.msg;
  });

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    const response = await fetch(`${link}/login`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const result = await response.json();
    if (result.type === "scs" && result.msg === "success") {
      window.location.href = "/";
    } else {
      const h2 = document.getElementById("err_login");
      h2.setAttribute("class", result.type);
      h2.textContent = result.msg;
    }
  });
