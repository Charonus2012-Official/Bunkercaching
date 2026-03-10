window.onload = function() {
    console.log("DOMContentLoaded");



    const title = document.getElementById("tit");
    const bi = document.getElementById("bi");
    const urlParams = new URLSearchParams(window.location.search);
    let bunkerID;

    bunkerID = urlParams.get("bunker_id");
    if (bunkerID === null) {
        window.location.href = "/logs/"
    } else {
        title.textContent = "Bunkercaching — " + bunkerID;
        bi.textContent = bunkerID;
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
};

const stars = document.querySelectorAll('.star');
const ratingText = document.getElementById('ratingText');
const ratingValue = document.getElementById('ratingValue');

let currentRating = 0;

const ratingTexts = {
    0: 'Click to rate',
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
};

stars.forEach(star => {
    star.addEventListener('mouseover', () => {
        const rating = parseInt(star.dataset.rating);
        highlightStars(rating);
        ratingText.textContent = ratingTexts[rating];
    });

    star.addEventListener('mouseout', () => {
        highlightStars(currentRating);
        ratingText.textContent = ratingTexts[currentRating];
    });

    star.addEventListener('click', () => {
        currentRating = parseInt(star.dataset.rating);
        ratingValue.value = currentRating;
        highlightStars(currentRating);
        ratingText.textContent = ratingTexts[currentRating];
    });
});

function highlightStars(rating) {
    stars.forEach((star, index) => {
        star.classList.remove('active', 'hover');
        if (index < rating) {
            if (index < currentRating) {
                star.classList.add('active');
            } else {
                star.classList.add('hover');
            }
        }
    });
}