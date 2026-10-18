
// Categories

const categories = {
    anime: {
        title: "MY ANIME LIST",
        total: "TOTAL ANIME",
        search: "Search anime in my list...",
        length: "Total Episodes:",
        step: "1"
    },
    series: {
        title: "MY SERIES LIST",
        total: "TOTAL SERIES",
        search: "Search series in my list...",
        length: "Total Episodes:",
        step: "1"
    },
    movie: {
        title: "MY MOVIE LIST",
        total: "TOTAL MOVIES",
        search: "Search movies in my list...",
        length: "Duration (minutes):",
        step: "1"
    },
    book: {
        title: "MY READING LIST",
        total: "TOTAL BOOKS",
        search: "Search books in my list...",
        length: "Total Pages:",
        step: "1"
    },
    game: {
        title: "MY GAME LIST",
        total: "TOTAL GAMES",
        search: "Search games in my list...",
        length: "Playtime (hours):",
        step: "0.1"
    }
};

const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get("category");

const currentCategory = categories[requestedCategory]
    ? requestedCategory
    : "anime";

// Navigation

document.getElementById("library-title").textContent =
    categories[currentCategory].title;

document.getElementById("total-label").textContent =
    categories[currentCategory].total;

document.getElementById("search-input").placeholder =
    categories[currentCategory].search;

document.getElementById("entry-length-label").textContent =
    categories[currentCategory].length;

document.querySelector('input[name="length"]').step =
    categories[currentCategory].step;

document.querySelectorAll(".main-nav a").forEach(link => {
    if (link.dataset.category === currentCategory) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
    }
});

// Filters

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
    });
});

// Authentication

async function checkSession() {
    try {
        const response = await fetch("/api/auth/me", {
            credentials: "same-origin"
        });

        if (!response.ok) {
            window.location.replace("/");
        }
    } catch (error) {
        console.error("Session check failed:", error);
        window.location.replace("/");
    }
}

// Logout

document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "same-origin"
        });

        if (!response.ok) {
            throw new Error("Logout failed");
        }

        window.location.replace("/");
    } catch (error) {
        document.getElementById("dashboard-message").textContent =
            "Could not log out. Please try again.";
    }
});

// Modal

const entryDialog = document.getElementById("entry-dialog");
const entryForm = document.getElementById("entry-form");
const saveMessage = document.getElementById("entry-save-message");

const closeEntryDialog = document.getElementById(
    "close-entry-dialog"
);

function openEntryDialog() {
    saveMessage.textContent = "";
    entryDialog.showModal();

    textFields.forEach(resizeTextField);
}

document.getElementById("add-new-btn").addEventListener(
    "click",
    openEntryDialog
);

closeEntryDialog.addEventListener("click", () => {
    entryDialog.close();
});

entryDialog.addEventListener("click", event => {
    const rect = entryDialog.getBoundingClientRect();

    const outside =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;

    if (outside) {
        entryDialog.close();
    }
});

// Text

const textFields = document.querySelectorAll(
    "#entry-description, #entry-review-text"
);

function resizeTextField(field) {
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight + 2}px`;
}

textFields.forEach(field => {
    field.addEventListener("input", () => {
        resizeTextField(field);
    });

    resizeTextField(field);
});

// Photo

const photoInput = document.getElementById("entry-photo-input");
const photoPreview = document.getElementById("entry-photo-preview");
const photoLabel = photoInput.closest(".entry-photo");

let photoUrl = null;

photoInput.addEventListener("change", () => {
    const file = photoInput.files[0];

    if (!file) {
        return;
    }

    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/gif"
    ];

    if (
        !allowedTypes.includes(file.type) ||
        file.size > 5 * 1024 * 1024
    ) {
        photoInput.value = "";
        saveMessage.textContent =
            "Choose a PNG, JPG, WEBP or GIF image up to 5 MB.";
        return;
    }

    if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
    }

    photoUrl = URL.createObjectURL(file);

    photoPreview.src = photoUrl;
    photoPreview.hidden = false;

    photoLabel.classList.add("has-image");

    saveMessage.textContent = "";
});

photoPreview.addEventListener("error", () => {
    photoPreview.hidden = true;
    photoLabel.classList.remove("has-image");

    saveMessage.textContent =
        "Could not preview the selected photo.";
});

// Rating

const ratingContainer = document.getElementById(
    "entry-rating-stars"
);

const ratingInput = document.getElementById("entry-rating");
const ratingValue = document.getElementById("entry-rating-value");

let selectedRating = 0;

function updateRating() {
    const buttons = ratingContainer.querySelectorAll(".star-button");

    buttons.forEach((button, index) => {
        const filledPart = Math.max(
            0,
            Math.min(1, selectedRating - index)
        );

        const fill = button.querySelector(".star-fill");

        fill.style.width = `${filledPart * 100}%`;

        button.setAttribute(
            "aria-pressed",
            filledPart > 0 ? "true" : "false"
        );
    });

    ratingInput.value = selectedRating === 0
        ? ""
        : String(selectedRating);

    ratingValue.textContent = `(${selectedRating}/5)`;
}

for (let number = 1; number <= 5; number++) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "star-button";

    button.setAttribute(
        "aria-label",
        `Rate up to ${number} stars`
    );

    button.innerHTML = `
        <img
            class="star-base"
            src="assets/star-empty.png"
            alt=""
        >
        <span class="star-fill" aria-hidden="true">
            <img
                class="star-filled-image"
                src="assets/star-filled.png"
                alt=""
            >
        </span>
    `;

    button.addEventListener("click", event => {
        const rect = button.getBoundingClientRect();

        const leftHalf =
            event.detail !== 0 &&
            event.clientX - rect.left < rect.width / 2;

        const newRating = number - (leftHalf ? 0.5 : 0);

        selectedRating = selectedRating === newRating
            ? 0
            : newRating;

        updateRating();
    });

    ratingContainer.appendChild(button);
}

updateRating();

// Save

entryForm.addEventListener("submit", event => {
    event.preventDefault();

    saveMessage.textContent =
        "Saving is not available yet.";
});

// Session

checkSession();
