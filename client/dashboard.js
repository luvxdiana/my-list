
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

// Elements

const entriesGrid = document.getElementById("entries-grid");
const addNewButton = document.getElementById("add-new-btn");
const searchField = document.getElementById("search-input");
const dashboardMessage = document.getElementById("dashboard-message");

const totalCountElement = document.getElementById("total-count");
const averageRatingElement = document.getElementById("average-rating");

const entryDialog = document.getElementById("entry-dialog");
const entryForm = document.getElementById("entry-form");
const saveButton = document.querySelector(".save-entry-btn");
const deleteButton = document.getElementById("delete-entry-btn");
const saveMessage = document.getElementById("entry-save-message");

const photoInput = document.getElementById("entry-photo-input");
const photoPreview = document.getElementById("entry-photo-preview");
const photoLabel = photoInput.closest(".entry-photo");

const ratingContainer = document.getElementById("entry-rating-stars");
const ratingInput = document.getElementById("entry-rating");
const ratingValue = document.getElementById("entry-rating-value");

const textFields = document.querySelectorAll(
    "#entry-description, #entry-review-text"
);

let savedEntries = [];
let selectedStatus = "all";
let selectedRating = 0;
let editingEntryId = null;
let photoUrl = null;

// Navigation

document.getElementById("library-title").textContent =
    categories[currentCategory].title;

document.getElementById("total-label").textContent =
    categories[currentCategory].total;

searchField.placeholder = categories[currentCategory].search;

document.getElementById("entry-length-label").textContent =
    categories[currentCategory].length;

entryForm.elements.namedItem("length").step =
    categories[currentCategory].step;

document.querySelectorAll(".main-nav a").forEach(link => {
    if (link.dataset.category === currentCategory) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
    }
});

// Authentication

async function checkSession() {
    try {
        const response = await fetch("/api/auth/me", {
            credentials: "same-origin"
        });

        if (!response.ok) {
            window.location.replace("/");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Session error:", error);
        window.location.replace("/");
        return false;
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
            throw new Error("Could not log out.");
        }

        window.location.replace("/");
    } catch (error) {
        dashboardMessage.textContent = error.message;
    }
});

// Text

function resizeTextField(field) {
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight + 2}px`;
}

textFields.forEach(field => {
    field.addEventListener("input", () => {
        resizeTextField(field);
    });
});

entryForm.addEventListener("keydown", event => {
    if (
        event.key === "Enter" &&
        event.target.matches('input[type="text"], input[type="number"]')
    ) {
        event.preventDefault();
    }
});

// Photo

function clearPhoto() {
    if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
        photoUrl = null;
    }

    photoInput.value = "";
    photoPreview.hidden = true;
    photoPreview.removeAttribute("src");
    photoLabel.classList.remove("has-image");
}

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
    saveMessage.textContent = "Could not preview the photo.";
});

// Rating

function updateRating() {
    const buttons = ratingContainer.querySelectorAll(".star-button");

    buttons.forEach((button, index) => {
        const filledPart = Math.max(
            0,
            Math.min(1, selectedRating - index)
        );

        button.querySelector(".star-fill").style.width =
            `${filledPart * 100}%`;
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
    button.setAttribute("aria-label", `Rate ${number} stars`);

    button.innerHTML = `
        <img class="star-base" src="assets/star-empty.png" alt="">
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

// Modal

function resetEntryForm() {
    entryForm.reset();
    clearPhoto();

    editingEntryId = null;
    selectedRating = 0;

    updateRating();

    deleteButton.hidden = true;
    saveButton.textContent = "SAVE";
    saveMessage.textContent = "";
}

function openNewEntry() {
    resetEntryForm();

    entryDialog.setAttribute("aria-label", "Add new entry");
    entryDialog.showModal();

    textFields.forEach(resizeTextField);
    document.querySelector(".entry-dialog-scroll").scrollTop = 0;
}

function getEntryLength(entry) {
    if (currentCategory === "anime" || currentCategory === "series") {
        return entry.total_episodes ?? "";
    }

    if (currentCategory === "movie") {
        return entry.duration_minutes ?? "";
    }

    if (currentCategory === "book") {
        return entry.total_pages ?? "";
    }

    if (currentCategory === "game") {
        return entry.playtime_hours ?? "";
    }

    return "";
}

function openEditEntry(entry) {
    resetEntryForm();

    editingEntryId = entry.id;

    entryForm.elements.namedItem("title").value = entry.title;
    entryForm.elements.namedItem("genre").value = entry.genre ?? "";
    entryForm.elements.namedItem("status").value = entry.status;
    entryForm.elements.namedItem("length").value = getEntryLength(entry);

    document.getElementById("entry-description").value =
        entry.description ?? "";

    document.getElementById("entry-review-text").value =
        entry.review ?? "";

    selectedRating = entry.rating === null
        ? 0
        : Number(entry.rating);

    updateRating();

    if (entry.image_url) {
        photoPreview.src = entry.image_url;
        photoPreview.hidden = false;
        photoLabel.classList.add("has-image");
    }

    deleteButton.hidden = false;
    saveButton.textContent = "SAVE CHANGES";

    entryDialog.setAttribute("aria-label", `Edit ${entry.title}`);
    entryDialog.showModal();

    textFields.forEach(resizeTextField);
    document.querySelector(".entry-dialog-scroll").scrollTop = 0;
}

addNewButton.addEventListener("click", openNewEntry);

document.getElementById("close-entry-dialog").addEventListener(
    "click",
    () => entryDialog.close()
);

entryDialog.addEventListener("click", event => {
    if (event.target !== entryDialog) {
        return;
    }

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

// Hover Stars

function createHoverStar(rating, index) {
    const star = document.createElement("span");
    star.className = "hover-star";

    const base = document.createElement("img");
    base.src = "assets/star-empty.png";
    base.alt = "";

    const fill = document.createElement("span");
    fill.className = "hover-star-fill";

    const filledImage = document.createElement("img");
    filledImage.src = "assets/star-filled.png";
    filledImage.alt = "";

    fill.appendChild(filledImage);

    const filledPart = Math.max(0, Math.min(1, rating - index));
    fill.style.width = `${filledPart * 100}%`;

    star.append(base, fill);

    return star;
}

// Library

async function loadEntries() {
    const response = await fetch(
        `/api/entries?category=${encodeURIComponent(currentCategory)}`,
        {
            credentials: "same-origin"
        }
    );

    if (!response.ok) {
        throw new Error("Could not load entries.");
    }

    const data = await response.json();

    savedEntries = data.entries;
    renderEntries();
}

function createEntryCard(entry) {
    const card = document.createElement("article");
    card.className = "media-entry";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "media-open";
    openButton.setAttribute("aria-label", `Open ${entry.title}`);

    const poster = document.createElement("div");
    poster.className = "media-poster";

    if (entry.image_url) {
        const image = document.createElement("img");

        image.src = entry.image_url;
        image.alt = entry.title;

        poster.appendChild(image);
    } else {
        const placeholder = document.createElement("span");

        placeholder.className = "media-placeholder";
        placeholder.textContent = "NO COVER";

        poster.appendChild(placeholder);
    }

    const title = document.createElement("p");
    title.className = "media-title";
    title.textContent = entry.title;

    openButton.append(poster, title);

    openButton.addEventListener("click", () => {
        openEditEntry(entry);
    });

    const details = document.createElement("div");
    details.className = "media-details";
    details.setAttribute("aria-hidden", "true");

    const hoverTitle = document.createElement("div");
    hoverTitle.className = "hover-title";
    hoverTitle.textContent = entry.title;

    const status = document.createElement("span");
    status.className = "hover-status";
    status.textContent = entry.status.toUpperCase();

    const reviewLabel = document.createElement("span");
    reviewLabel.className = "hover-review-label";
    reviewLabel.textContent = "My Review:";

    const ratingRow = document.createElement("div");
    ratingRow.className = "hover-rating-row";

    const stars = document.createElement("div");
    stars.className = "hover-stars";

    const rating = entry.rating === null
        ? 0
        : Number(entry.rating);

    for (let index = 0; index < 5; index++) {
        stars.appendChild(createHoverStar(rating, index));
    }

    const ratingText = document.createElement("span");
    ratingText.className = "hover-rating-value";
    ratingText.textContent = `(${rating}/5)`;

    ratingRow.append(stars, ratingText);

    details.append(
        hoverTitle,
        status,
        reviewLabel,
        ratingRow
    );

    card.append(openButton, details);

    return card;
}

function renderEntries() {
    totalCountElement.textContent = savedEntries.length;

    const ratings = savedEntries
        .filter(entry => entry.rating !== null)
        .map(entry => Number(entry.rating));

    if (ratings.length > 0) {
        const sum = ratings.reduce((total, value) => total + value, 0);

        averageRatingElement.textContent =
            (sum / ratings.length).toFixed(1);
    } else {
        averageRatingElement.textContent = "—";
    }

    const statusLabels = {
        all: "ALL",
        completed: "COMPLETED",
        incomplete: "INCOMPLETE",
        dropped: "DROPPED"
    };

    document.querySelectorAll(".filter-btn").forEach(button => {
        const status = button.dataset.status;

        const count = status === "all"
            ? savedEntries.length
            : savedEntries.filter(entry => entry.status === status).length;

        button.textContent = `${statusLabels[status]} (${count})`;
        button.classList.toggle("active", status === selectedStatus);
    });

    const searchText = searchField.value.trim().toLowerCase();

    const visibleEntries = savedEntries.filter(entry => {
        const matchesStatus =
            selectedStatus === "all" ||
            entry.status === selectedStatus;

        const matchesSearch =
            entry.title.toLowerCase().includes(searchText);

        return matchesStatus && matchesSearch;
    });

    entriesGrid.querySelectorAll(".media-entry").forEach(card => {
        card.remove();
    });

    visibleEntries.forEach(entry => {
        const card = createEntryCard(entry);

        entriesGrid.insertBefore(card, addNewButton);
    });
}

// Filters

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        selectedStatus = button.dataset.status;
        renderEntries();
    });
});

// Search

searchField.addEventListener("input", renderEntries);


// Save

entryForm.addEventListener("submit", async event => {
    event.preventDefault();

    const formData = new FormData(entryForm);
    const photoFile = photoInput.files[0] || null;

    const lengthValue = formData.get("length");
    const ratingValue = formData.get("rating");

    const entry = {
        category: currentCategory,
        title: formData.get("title").trim(),
        genre: formData.get("genre").trim(),
        description: formData.get("description").trim(),
        review: formData.get("review").trim(),
        status: formData.get("status"),
        rating: ratingValue === "" ? null : Number(ratingValue),
        length: lengthValue === "" ? null : Number(lengthValue)
    };

    const isEditing = editingEntryId !== null;

    const url = isEditing
        ? `/api/entries/${encodeURIComponent(editingEntryId)}`
        : "/api/entries";

    saveButton.disabled = true;
    saveButton.textContent = "SAVING...";
    saveMessage.textContent = "";
    dashboardMessage.textContent = "";

    let entrySaved = false;
    let savedEntryId = editingEntryId;

    try {
        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(entry)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not save entry.");
        }

        entrySaved = true;
        savedEntryId = data.entry.id;

        if (photoFile) {
            saveButton.textContent = "UPLOADING PHOTO...";

            const photoData = new FormData();
            photoData.append("photo", photoFile);

            const photoResponse = await fetch(
                `/api/entries/${encodeURIComponent(savedEntryId)}/photo`,
                {
                    method: "POST",
                    credentials: "same-origin",
                    body: photoData
                }
            );

            const photoResult = await photoResponse.json();

            if (!photoResponse.ok) {
                throw new Error(
                    photoResult.message || "Could not upload photo."
                );
            }
        }

        entryDialog.close();
        resetEntryForm();

        try {
            await loadEntries();

            dashboardMessage.textContent = isEditing
                ? "Entry updated successfully."
                : "Entry saved successfully.";
        } catch (error) {
            console.error(error);

            dashboardMessage.textContent =
                "Entry saved, but the library could not refresh.";
        }
    } catch (error) {
        if (entrySaved) {
            editingEntryId = savedEntryId;
            deleteButton.hidden = false;

            saveMessage.textContent =
                `Entry saved, but the photo could not be uploaded: ${error.message}`;

            try {
                await loadEntries();
            } catch (loadError) {
                console.error(loadError);
            }
        } else {
            saveMessage.textContent = error.message;
        }
    } finally {
        saveButton.disabled = false;

        saveButton.textContent = editingEntryId === null
            ? "SAVE"
            : "SAVE CHANGES";
    }
});


// Delete

deleteButton.addEventListener("click", async () => {
    if (editingEntryId === null) {
        return;
    }

    const confirmed = window.confirm(
        "Delete this entry permanently?"
    );

    if (!confirmed) {
        return;
    }

    deleteButton.disabled = true;
    saveMessage.textContent = "";

    try {
        const response = await fetch(
            `/api/entries/${encodeURIComponent(editingEntryId)}`,
            {
                method: "DELETE",
                credentials: "same-origin"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not delete entry.");
        }

        entryDialog.close();
        resetEntryForm();

        try {
            await loadEntries();
            dashboardMessage.textContent =
                "Entry deleted successfully.";
        } catch (error) {
            console.error(error);
            dashboardMessage.textContent =
                "Entry deleted, but the library could not refresh.";
        }
    } catch (error) {
        saveMessage.textContent = error.message;
    } finally {
        deleteButton.disabled = false;
    }
});

// Session

async function startDashboard() {
    const authenticated = await checkSession();

    if (!authenticated) {
        return;
    }

    try {
        await loadEntries();
    } catch (error) {
        console.error(error);
        dashboardMessage.textContent = "Could not load entries.";
    }
}

startDashboard();
