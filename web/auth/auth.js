document.getElementById("signupForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    const h2 = document.getElementById("err_signup");
    h2.setAttribute("class", result.type);
    if (result.type === "scs") {
        document.querySelectorAll(".signlog").forEach(el => {
            el.value = "";
        });
    }
    h2.textContent = result.msg;
});

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        body: formData
    });


    const result = await response.json();
    if (result.type === "scs" && result.msg === "success") {

    } else {
        const h2 = document.getElementById("err_login");
        h2.setAttribute("class", result.type);
        h2.textContent = result.msg;
    }
});