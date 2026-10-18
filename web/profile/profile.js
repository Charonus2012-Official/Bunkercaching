window.onload = function () {
  fetch("/api/me", {
    method: "POST",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        window.location.href = "/auth";
        return;
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.username) {
        document.getElementById("username-display").textContent = data.username;
      }
    })
    .catch((err) => {
      console.log(err.message);
      window.location.href = "/auth";
    });

  document.getElementById("logout-btn").addEventListener("click", async function () {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      window.location.href = "/";
    }
  });
};
