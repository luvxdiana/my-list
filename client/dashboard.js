const translateDashboard = (key, parameters) =>
  window.MyListI18n?.t(key, parameters) ?? key;
const localizedDashboardGenre = (name) => {
  const key = `genre.${name}`;
  const value = translateDashboard(key);
  return value === key ? name : value;
};
// Categories

const categories = {
  anime: {
    title: () => translateDashboard("dashboard.category.anime.title"),
    total: () => translateDashboard("dashboard.category.anime.total"),
    search: () => translateDashboard("dashboard.category.anime.search"),
    length: () => translateDashboard("dashboard.category.anime.length"),
    step: "1",
  },
  series: {
    title: () => translateDashboard("dashboard.category.series.title"),
    total: () => translateDashboard("dashboard.category.series.total"),
    search: () => translateDashboard("dashboard.category.series.search"),
    length: () => translateDashboard("dashboard.category.series.length"),
    step: "1",
  },
  movie: {
    title: () => translateDashboard("dashboard.category.movie.title"),
    total: () => translateDashboard("dashboard.category.movie.total"),
    search: () => translateDashboard("dashboard.category.movie.search"),
    length: () => translateDashboard("dashboard.category.movie.length"),
    step: "1",
  },
  book: {
    title: () => translateDashboard("dashboard.category.book.title"),
    total: () => translateDashboard("dashboard.category.book.total"),
    search: () => translateDashboard("dashboard.category.book.search"),
    length: () => translateDashboard("dashboard.category.book.length"),
    step: "1",
  },
  game: {
    title: () => translateDashboard("dashboard.category.game.title"),
    total: () => translateDashboard("dashboard.category.game.total"),
    search: () => translateDashboard("dashboard.category.game.search"),
    length: () => translateDashboard("dashboard.category.game.length"),
    step: "0.1",
  },
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
const removePhotoButton = document.getElementById("remove-photo-btn");
const photoPreview = document.getElementById("entry-photo-preview");
const photoLabel = photoInput.closest(".entry-photo");

const ratingContainer = document.getElementById("entry-rating-stars");
const ratingInput = document.getElementById("entry-rating");
const ratingValue = document.getElementById("entry-rating-value");

const textFields = document.querySelectorAll(
  "#entry-description, #entry-review-text",
);

let savedEntries = [];
let selectedStatus = "all";
let selectedRating = 0;
let editingEntryId = null;
let photoUrl = null;
let removePhotoRequested = false;

// Genre Selection

const genrePicker = document.getElementById("entry-genre-picker");
const genreOptions = document.getElementById("entry-genre-options");
const genreSelection = document.getElementById("entry-genre-selection");
const genreHint = document.getElementById("entry-genre-hint");
const genreInput = document.getElementById("entry-genre-value");
const MAX_ENTRY_GENRES = 5;
const MAX_ENTRY_GENRE_LENGTH = 100;

const availableEntryGenres = [];
const selectedEntryGenres = new Set();
let legacyGenreValue = null;
let genreSelectionChanged = false;
let genresLoaded = false;

function serializedEntryGenres(names = [...selectedEntryGenres]) {
  return names.join(", ");
}

function updateGenrePicker() {
  const names = [...selectedEntryGenres];
  const value = serializedEntryGenres(names);

  genreInput.value =
    legacyGenreValue !== null && !genreSelectionChanged
      ? legacyGenreValue
      : value;

  genreSelection.textContent =
    names.length > 0
      ? names.map((name) => localizedDashboardGenre(name)).join(", ")
      : translateDashboard("dashboard.genres.select");

  if (legacyGenreValue !== null && !genreSelectionChanged) {
    genreSelection.textContent =
      legacyGenreValue || translateDashboard("dashboard.genres.select");
    genreHint.textContent = translateDashboard("dashboard.genres.legacy");
  } else if (genresLoaded) {
    genreHint.textContent = translateDashboard("dashboard.genres.count", {
      count: names.length,
      max: MAX_ENTRY_GENRES,
      limit: MAX_ENTRY_GENRE_LENGTH,
    });
  }

  genreOptions.querySelectorAll(".entry-genre-option").forEach((button) => {
    const name = button.dataset.genre;
    const selected = selectedEntryGenres.has(name);
    const wouldBeTooLong =
      serializedEntryGenres([...names, name]).length > MAX_ENTRY_GENRE_LENGTH;
    button.setAttribute("aria-pressed", String(selected));
    button.disabled =
      !selected && (names.length >= MAX_ENTRY_GENRES || wouldBeTooLong);
  });
}

function resetGenrePicker() {
  selectedEntryGenres.clear();
  legacyGenreValue = null;
  genreSelectionChanged = false;
  genrePicker.open = false;
  updateGenrePicker();
}

function restoreEntryGenres(savedValue) {
  const raw = typeof savedValue === "string" ? savedValue : "";
  const names = raw
    ? raw
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean)
    : [];
  const knownNames = new Set(availableEntryGenres);

  selectedEntryGenres.clear();
  names.forEach((name) => {
    if (knownNames.has(name)) selectedEntryGenres.add(name);
  });

  // Preserve legacy strings (including unknown spellings or formats)
  // until the user explicitly changes the selection.
  legacyGenreValue =
    !genresLoaded ||
    names.length > MAX_ENTRY_GENRES ||
    names.length !== selectedEntryGenres.size ||
    serializedEntryGenres(names) !== raw
      ? raw
      : null;
  genreSelectionChanged = false;
  updateGenrePicker();
}

function renderEntryGenres() {
  genreOptions.replaceChildren();

  availableEntryGenres.forEach((name) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "entry-genre-option";
    button.dataset.genre = name;
    button.textContent = localizedDashboardGenre(name);
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      genreSelectionChanged = true;
      legacyGenreValue = null;
      if (selectedEntryGenres.has(name)) {
        selectedEntryGenres.delete(name);
      } else {
        selectedEntryGenres.add(name);
      }
      updateGenrePicker();
    });
    genreOptions.appendChild(button);
  });
  updateGenrePicker();
}

async function loadEntryGenres() {
  try {
    const response = await fetch("/api/compass/onboarding/options", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error(translateDashboard("dashboard.genres.loadError"));
    const data = await response.json();
    if (!Array.isArray(data.genres))
      throw new Error(translateDashboard("dashboard.genres.invalidResponse"));

    availableEntryGenres.splice(
      0,
      availableEntryGenres.length,
      ...data.genres
        .filter((item) => item && typeof item.name === "string")
        .map((item) => item.name.trim())
        .filter(Boolean),
    );
    genresLoaded = true;
    renderEntryGenres();
  } catch (error) {
    console.error("Load genres error:", error);
    genreHint.textContent = translateDashboard("dashboard.genres.unavailable");
  }
}

// Navigation

function updateLocalizedCategory() {
  document.getElementById("library-title").textContent =
    categories[currentCategory].title();

  document.getElementById("total-label").textContent =
    categories[currentCategory].total();

  searchField.placeholder = categories[currentCategory].search();

  document.getElementById("entry-length-label").textContent =
    categories[currentCategory].length();
}

updateLocalizedCategory();

entryForm.elements.namedItem("length").step = categories[currentCategory].step;

document.querySelectorAll(".main-nav a").forEach((link) => {
  if (link.dataset.category === currentCategory) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
});

// Authentication

async function checkSession() {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "same-origin",
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
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error(translateDashboard("dashboard.logout.error"));
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

textFields.forEach((field) => {
  field.addEventListener("input", () => {
    resizeTextField(field);
  });
});

entryForm.addEventListener("keydown", (event) => {
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

  removePhotoButton.hidden = true;
  removePhotoRequested = false;
}

photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];

  if (!file) {
    return;
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];

  if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
    photoInput.value = "";
    saveMessage.textContent = translateDashboard("dashboard.photo.format");
    return;
  }

  if (photoUrl) {
    URL.revokeObjectURL(photoUrl);
  }

  photoUrl = URL.createObjectURL(file);
  photoPreview.src = photoUrl;
  photoPreview.hidden = false;
  photoLabel.classList.add("has-image");
  removePhotoButton.hidden = false;
  removePhotoRequested = false;

  saveMessage.textContent = "";
});

photoPreview.addEventListener("error", () => {
  photoPreview.hidden = true;
  photoLabel.classList.remove("has-image");
  saveMessage.textContent = translateDashboard("dashboard.photo.preview");
});

removePhotoButton.addEventListener("click", () => {
  const existingEntry = savedEntries.find((entry) => {
    return String(entry.id) === String(editingEntryId);
  });

  const hasStoredPhoto = Boolean(existingEntry?.image_url);

  clearPhoto();
  removePhotoRequested = hasStoredPhoto;
  saveMessage.textContent = "";
});

// Rating

function updateRating() {
  const buttons = ratingContainer.querySelectorAll(".star-button");

  buttons.forEach((button, index) => {
    const filledPart = Math.max(0, Math.min(1, selectedRating - index));

    button.querySelector(".star-fill").style.width = `${filledPart * 100}%`;
  });

  ratingInput.value = selectedRating === 0 ? "" : String(selectedRating);

  ratingValue.textContent = `(${selectedRating}/5)`;
}

for (let number = 1; number <= 5; number++) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "star-button";
  button.setAttribute(
    "aria-label",
    translateDashboard("dashboard.ratingStars", { number }),
  );

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

  button.addEventListener("click", (event) => {
    const rect = button.getBoundingClientRect();

    const leftHalf =
      event.detail !== 0 && event.clientX - rect.left < rect.width / 2;

    const newRating = number - (leftHalf ? 0.5 : 0);

    selectedRating = selectedRating === newRating ? 0 : newRating;

    updateRating();
  });

  ratingContainer.appendChild(button);
}

updateRating();

// Modal

function resetEntryForm() {
  entryForm.reset();
  resetGenrePicker();
  clearPhoto();

  editingEntryId = null;
  selectedRating = 0;

  updateRating();

  deleteButton.hidden = true;
  saveButton.textContent = translateDashboard("dashboard.save");
  saveMessage.textContent = "";
}

function openNewEntry() {
  resetEntryForm();

  entryDialog.setAttribute(
    "aria-label",
    translateDashboard("dashboard.addEntry"),
  );
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
  restoreEntryGenres(entry.genre);
  entryForm.elements.namedItem("status").value = entry.status;
  entryForm.elements.namedItem("length").value = getEntryLength(entry);

  document.getElementById("entry-description").value = entry.description ?? "";

  document.getElementById("entry-review-text").value = entry.review ?? "";

  selectedRating = entry.rating === null ? 0 : Number(entry.rating);

  updateRating();

  if (entry.image_url) {
    photoPreview.src = entry.image_url;
    photoPreview.hidden = false;
    photoLabel.classList.add("has-image");
    removePhotoButton.hidden = false;
  }

  deleteButton.hidden = false;
  saveButton.textContent = translateDashboard("dashboard.saveChanges");

  entryDialog.setAttribute(
    "aria-label",
    translateDashboard("dashboard.editEntry", { title: entry.title }),
  );
  entryDialog.showModal();

  textFields.forEach(resizeTextField);
  document.querySelector(".entry-dialog-scroll").scrollTop = 0;
}

addNewButton.addEventListener("click", openNewEntry);

document
  .getElementById("close-entry-dialog")
  .addEventListener("click", () => entryDialog.close());

entryDialog.addEventListener("click", (event) => {
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
      credentials: "same-origin",
    },
  );

  if (!response.ok) {
    throw new Error(translateDashboard("dashboard.entry.loadError"));
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
  openButton.setAttribute(
    "aria-label",
    translateDashboard("dashboard.openEntry", { title: entry.title }),
  );

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
    placeholder.textContent = translateDashboard("dashboard.noCover");

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
  status.textContent = translateDashboard(`dashboard.status.${entry.status}`);

  const reviewLabel = document.createElement("span");
  reviewLabel.className = "hover-review-label";
  reviewLabel.textContent = translateDashboard("dashboard.myReview");

  const ratingRow = document.createElement("div");
  ratingRow.className = "hover-rating-row";

  const stars = document.createElement("div");
  stars.className = "hover-stars";

  const rating = entry.rating === null ? 0 : Number(entry.rating);

  for (let index = 0; index < 5; index++) {
    stars.appendChild(createHoverStar(rating, index));
  }

  const ratingText = document.createElement("span");
  ratingText.className = "hover-rating-value";
  ratingText.textContent = `(${rating}/5)`;

  ratingRow.append(stars, ratingText);

  details.append(hoverTitle, status, reviewLabel, ratingRow);

  card.append(openButton, details);

  return card;
}

function renderEntries() {
  totalCountElement.textContent = savedEntries.length;

  const ratings = savedEntries
    .filter((entry) => entry.rating !== null)
    .map((entry) => Number(entry.rating));

  if (ratings.length > 0) {
    const sum = ratings.reduce((total, value) => total + value, 0);

    averageRatingElement.textContent = (sum / ratings.length).toFixed(1);
  } else {
    averageRatingElement.textContent = "—";
  }

  const statusLabels = {
    all: translateDashboard("dashboard.status.all"),
    completed: translateDashboard("dashboard.status.completed"),
    incomplete: translateDashboard("dashboard.status.incomplete"),
    dropped: translateDashboard("dashboard.status.dropped"),
  };

  document.querySelectorAll(".filter-btn").forEach((button) => {
    const status = button.dataset.status;

    const count =
      status === "all"
        ? savedEntries.length
        : savedEntries.filter((entry) => entry.status === status).length;

    button.textContent = `${statusLabels[status]} (${count})`;
    button.classList.toggle("active", status === selectedStatus);
  });

  const searchText = searchField.value.trim().toLowerCase();

  const visibleEntries = savedEntries.filter((entry) => {
    const matchesStatus =
      selectedStatus === "all" || entry.status === selectedStatus;

    const matchesSearch = entry.title.toLowerCase().includes(searchText);

    return matchesStatus && matchesSearch;
  });

  entriesGrid.querySelectorAll(".media-entry").forEach((card) => {
    card.remove();
  });

  visibleEntries.forEach((entry) => {
    const card = createEntryCard(entry);

    entriesGrid.insertBefore(card, addNewButton);
  });
}

// Filters

document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    selectedStatus = button.dataset.status;
    renderEntries();
  });
});

// Search

searchField.addEventListener("input", renderEntries);

// Save

entryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(entryForm);
  const photoFile = photoInput.files[0] || null;

  const lengthValue = formData.get("length");
  const ratingValue = formData.get("rating");
  const entryGenres = genreInput.value;

  if (entryGenres.length > MAX_ENTRY_GENRE_LENGTH) {
    saveMessage.textContent = translateDashboard("dashboard.genres.tooLong");
    return;
  }

  const entry = {
    category: currentCategory,
    title: formData.get("title").trim(),
    genre: entryGenres,
    description: formData.get("description").trim(),
    review: formData.get("review").trim(),
    status: formData.get("status"),
    rating: ratingValue === "" ? null : Number(ratingValue),
    length: lengthValue === "" ? null : Number(lengthValue),
  };

  const isEditing = editingEntryId !== null;

  const url = isEditing
    ? `/api/entries/${encodeURIComponent(editingEntryId)}`
    : "/api/entries";

  saveButton.disabled = true;
  saveButton.textContent = translateDashboard("dashboard.saving");
  saveMessage.textContent = "";
  dashboardMessage.textContent = "";

  let entrySaved = false;
  let savedEntryId = editingEntryId;

  try {
    const response = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify(entry),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || translateDashboard("dashboard.entry.saveError"),
      );
    }

    entrySaved = true;
    savedEntryId = data.entry.id;

    if (photoFile) {
      saveButton.textContent = translateDashboard("dashboard.photo.uploading");

      const photoData = new FormData();
      photoData.append("photo", photoFile);

      const photoResponse = await fetch(
        `/api/entries/${encodeURIComponent(savedEntryId)}/photo`,
        {
          method: "POST",
          credentials: "same-origin",
          body: photoData,
        },
      );

      const photoResult = await photoResponse.json();

      if (!photoResponse.ok) {
        throw new Error(
          photoResult.message ||
            translateDashboard("dashboard.photo.uploadError"),
        );
      }
    } else if (removePhotoRequested && isEditing) {
      saveButton.textContent = translateDashboard("dashboard.photo.removing");

      const photoResponse = await fetch(
        `/api/entries/${encodeURIComponent(savedEntryId)}/photo`,
        {
          method: "DELETE",
          credentials: "same-origin",
        },
      );

      const photoResult = await photoResponse.json();

      if (!photoResponse.ok) {
        throw new Error(
          photoResult.message ||
            translateDashboard("dashboard.photo.removeError"),
        );
      }
    }

    entryDialog.close();
    resetEntryForm();

    try {
      await loadEntries();

      dashboardMessage.textContent = isEditing
        ? translateDashboard("dashboard.entry.updated")
        : translateDashboard("dashboard.entry.saved");
    } catch (error) {
      console.error(error);

      dashboardMessage.textContent = translateDashboard(
        "dashboard.entry.refreshFailed",
      );
    }
  } catch (error) {
    if (entrySaved) {
      editingEntryId = savedEntryId;
      deleteButton.hidden = false;

      saveMessage.textContent = translateDashboard(
        "dashboard.entry.photoFailed",
        { message: error.message },
      );

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

    saveButton.textContent =
      editingEntryId === null
        ? translateDashboard("dashboard.save")
        : translateDashboard("dashboard.saveChanges");
  }
});

// Delete Choice

function chooseCompassDeleteAction(entry) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.setAttribute(
      "aria-label",
      translateDashboard("dashboard.delete.title", { title: entry.title }),
    );
    dialog.style.cssText = `
      position: fixed; inset: 0; margin: auto;
      box-sizing: border-box; max-width: 480px; width: calc(100% - 32px);
      max-height: calc(100dvh - 32px); overflow-y: auto;
      border-radius: 18px; background: #393d7c; color: #fff;
      padding: 26px; border: 1px solid #b47ad7; font: inherit;
      box-shadow: 0 22px 65px rgba(15, 12, 55, .45);
    `;
    const heading = document.createElement("h3");
    heading.textContent = translateDashboard("dashboard.delete.title", {
      title: entry.title,
    });
    heading.style.cssText =
      "margin: 0 0 10px; color: #e2b8ff; font-size: 22px; line-height: 1.3;";
    const description = document.createElement("p");
    description.textContent = translateDashboard(
      "dashboard.delete.description",
    );
    description.style.cssText =
      "margin: 0 0 18px; color: #f0e8ff; opacity: .9; font-size: 15px; line-height: 1.5;";
    const form = document.createElement("form");
    form.method = "dialog";
    const groupName = "compass-delete-action";
    for (const [value, titleKey, hintKey] of [
      ["reset_compass", "dashboard.delete.reset", "dashboard.delete.resetHint"],
      ["keep_watched", "dashboard.delete.keep", "dashboard.delete.keepHint"],
    ]) {
      const label = document.createElement("label");
      label.style.cssText =
        "display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 13px 10px; border-radius: 10px; background: rgba(255,255,255,.07); margin-bottom: 8px;";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = groupName;
      radio.value = value;
      radio.checked = value === "reset_compass";
      radio.style.cssText =
        "accent-color: #c889eb; margin-top: 5px; width: 17px; height: 17px; flex-shrink: 0;";
      const lines = document.createElement("span");
      const title = document.createElement("strong");
      title.textContent = translateDashboard(titleKey);
      title.style.cssText =
        "display: block; color: #fff; font-size: 15px; line-height: 1.4;";
      const hint = document.createElement("small");
      hint.textContent = `*${translateDashboard(hintKey)}`;
      hint.style.cssText =
        "display: block; color: #dfd4f0; font-size: 12px; margin-top: 4px; line-height: 1.45;";
      lines.append(title, hint);
      label.append(radio, lines);
      form.append(label);
    }
    const actions = document.createElement("div");
    actions.style.cssText =
      "display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; flex-wrap: wrap;";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = translateDashboard("dashboard.delete.cancel");
    const confirm = document.createElement("button");
    confirm.type = "submit";
    confirm.textContent = translateDashboard("dashboard.delete.confirm");
    for (const button of [cancel, confirm]) {
      button.style.cssText = `
        padding: 10px 18px; border-radius: 10px; font: inherit;
        font-weight: 600; cursor: pointer; color: #fff;
        border: 1px solid rgba(255,255,255,.5);
        background: transparent;
      `;
    }
    confirm.style.cssText += "background: #b47ad7; border-color: #b47ad7;";
    cancel.addEventListener("click", () => dialog.close());
    actions.append(cancel, confirm);
    form.append(actions);
    dialog.append(heading, description, form);
    document.body.append(dialog);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const selected = form.querySelector(`input[name="${groupName}"]:checked`);
      dialog.close(selected?.value || "");
    });
    dialog.addEventListener(
      "close",
      () => {
        const value = dialog.returnValue;
        dialog.remove();
        resolve(
          ["reset_compass", "keep_watched"].includes(value) ? value : null,
        );
      },
      { once: true },
    );
    dialog.showModal();
  });
}

// Delete

deleteButton.addEventListener("click", async () => {
  if (editingEntryId === null) {
    return;
  }

  const entry = savedEntries.find(
    (item) => String(item.id) === String(editingEntryId),
  );
  const linked =
    entry &&
    ["movie", "series"].includes(entry.category) &&
    Number.isInteger(Number(entry.tmdb_id)) &&
    Number(entry.tmdb_id) > 0;
  const compassAction = linked
    ? await chooseCompassDeleteAction(entry)
    : window.confirm(translateDashboard("dashboard.entry.deleteConfirm"))
      ? "library_only"
      : null;
  if (!compassAction) return;

  deleteButton.disabled = true;
  saveMessage.textContent = "";

  try {
    const response = await fetch(
      `/api/entries/${encodeURIComponent(editingEntryId)}`,
      {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          compassAction === "library_only"
            ? {}
            : { compass_action: compassAction },
        ),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || translateDashboard("dashboard.entry.deleteError"),
      );
    }

    entryDialog.close();
    resetEntryForm();

    try {
      await loadEntries();
      dashboardMessage.textContent = translateDashboard(
        "dashboard.entry.deleted",
      );
    } catch (error) {
      console.error(error);
      dashboardMessage.textContent = translateDashboard(
        "dashboard.entry.deleteRefreshFailed",
      );
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

  await loadEntryGenres();

  try {
    await loadEntries();
  } catch (error) {
    console.error(error);
    dashboardMessage.textContent = translateDashboard(
      "dashboard.entry.loadError",
    );
  }
}

startDashboard();

// Language changes
document.addEventListener("mylist:languagechange", () => {
  updateLocalizedCategory();
  renderEntryGenres();
  updateGenrePicker();
  ratingContainer.querySelectorAll(".star-button").forEach((button, index) => {
    button.setAttribute(
      "aria-label",
      translateDashboard("dashboard.ratingStars", { number: index + 1 }),
    );
  });
  if (entryDialog.open) {
    saveButton.textContent =
      editingEntryId === null
        ? translateDashboard("dashboard.save")
        : translateDashboard("dashboard.saveChanges");
    entryDialog.setAttribute(
      "aria-label",
      editingEntryId === null
        ? translateDashboard("dashboard.addEntry")
        : translateDashboard("dashboard.editEntry", {
            title: entryForm.elements.namedItem("title").value,
          }),
    );
  }
  renderEntries();
});

// Apply category-specific labels after shared page translations are initialized.
document.addEventListener("DOMContentLoaded", updateLocalizedCategory);
