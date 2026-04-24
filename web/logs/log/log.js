window.addEventListener("load", function () {
  const title = document.getElementById("tit");
  const bi = document.getElementById("bi");
  const urlParams = new URLSearchParams(window.location.search);
  let bunkerID;
  let bunkerType;
  let bunkerName;

  bunkerID = urlParams.get("bunker_id");
  bunkerType = urlParams.get("type");
  if (bunkerID === "" || bunkerType === "") {
    window.location.href = "/logs/";
  }
  fetch("/api/me", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return { good: response.ok };
    })
    .then((data) => {
      if (!data.good) {
        window.location.href = "/auth/";
      }
    });

  fetch(`/api/id?id=${bunkerID}&type=${bunkerType}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((data) => {
      if (bunkerType === "lo") {
        bunkerName = data["output"][3];
      } else {
        bunkerName = data["output"][2] + " — " + data["output"][3];
      }
      title.textContent = "Bunkercaching — " + bunkerName;
      bi.textContent = bunkerName;
    });

  document.getElementById("bunker_id").value = bunkerID;
  document.getElementById("type").value = bunkerType;
});

document.getElementById("logForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = new FormData(this);
  fetch("/api/log", {
    method: "POST",
    credentials: "include",
    body: data,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((data) => {
      if (data.message === "log put in") {
        window.location.href = "/logs/";
      }
    });
});
