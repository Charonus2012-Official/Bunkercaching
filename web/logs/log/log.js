window.onload = function() {


    const title = document.getElementById("tit");
    const bi = document.getElementById("bi");
    const urlParams = new URLSearchParams(window.location.search);
    let bunkerID;
    let bunkerType;
    let bunkerName;

    bunkerID = urlParams.get("bunker_id");
    bunkerType = urlParams.get("type");
    if (bunkerID === "" || bunkerType === "") {
        window.location.href = "/logs/"
    }
    fetch("http://localhost:8000/me", {
        method: "POST",
        credentials: "include",
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            return {"good": response.ok}
        })
        .then(data => {
            if (!data.good) {
                window.location.href = "/auth/"
            }
        })




    fetch(`http://localhost:8000/id/?id=${bunkerID}&type=${bunkerType}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    })
    .then(data => {
        if (bunkerType === "lo") {
            bunkerName = data["output"][3];
        } else {
            bunkerName = data["output"][1] + " - " + data["output"][2];
        }
        title.textContent = "Bunkercaching — " + bunkerName;
        bi.textContent = bunkerName;
    });
};
