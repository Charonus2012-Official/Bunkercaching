window.addEventListener("load", function () {
  const title = document.getElementById("tit");
  const bi = document.getElementById("bi");
  const urlParams = new URLSearchParams(window.location.search);
  let bunkerID;
  let bunkerType;
  let bunkerName;
  let editLogId = urlParams.get('edit');

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
      if (!data.good) {
        window.location.href = "/logs"
      }
      if (bunkerType === "lo") {
        bunkerName = data["output"][3];
      } else {
        bunkerName = data["output"][2] + " — " + data["output"][3];
      }
      title.textContent = "Bunkercaching — " + bunkerName;
      bi.textContent = bunkerName;
    })

  document.getElementById("bunker_id").value = bunkerID;
  document.getElementById("type").value = bunkerType;

  if (editLogId) {
    fetch(`/api/log/detail`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ log_id: parseInt(editLogId) })
    })
    .then(response => response.json())
    .then(data => {
      if (data.log_text) {
        document.getElementById("log_text").value = data.log_text;
      }
      if (data.concept) {
        document.getElementById("concept").checked = data.concept;
      }
    });
  }
});

document.getElementById("logForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const editLogId = urlParams.get('edit');
  const data = new FormData(this);
  
  const endpoint = editLogId ? "/api/log/edit" : "/api/log";
  const method = editLogId ? "POST" : "POST";
  
  if (editLogId) {
    data.append("log_id", editLogId);
  }

  fetch(endpoint, {
    method: method,
    credentials: "include",
    body: data,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((data) => {
      if (data.message === "log put in" || data.message === "log updated") {
        window.location.href = "/logs/";
      }
    });
});
