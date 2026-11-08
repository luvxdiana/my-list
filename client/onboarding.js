// Elements

const genresStep = document.getElementById("genres-step");
const contentStep = document.getElementById("content-step");
const resultStep = document.getElementById("result-step");

const genreGrid = document.getElementById("genre-grid");
const genreStatus = document.getElementById("genre-status");
const genreCounter = document.getElementById("genre-counter");

const genresNextButton = document.getElementById("genres-next-btn");
const contentBackButton = document.getElementById("content-back-btn");
const contentNextButton = document.getElementById("content-next-btn");
const editProfileButton = document.getElementById("edit-profile-btn");

const progressText = document.getElementById("progress-text");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");

const selectedGenresContainer = document.getElementById("selected-genres");
const selectedContentElement = document.getElementById("selected-content");

const resultNotice = document.querySelector(".result-notice");
const previewNotice = document.querySelector(".preview-notice");
const previewBadge = document.querySelector(".preview-badge");

// State

const MIN_GENRES = 3;
const MAX_GENRES = 5;

const selectedGenres = new Set();
const availableGenres = new Map();

const contentLabels = {
  movie: "🎬 Movies",
  series: "📺 Series",
  either: "✨ Movies & Series",
};

let isSaving = false;

// Page Information

if (previewNotice) {
  previewNotice.textContent =
    "Your preferences will be saved only when you click " +
    "SAVE MY PROFILE. You can update them later.";
}

if (previewBadge) {
  previewBadge.textContent = "PROFILE SETUP";
}

// Save Button

const saveProfileButton = document.createElement("button");

saveProfileButton.id = "save-profile-btn";
saveProfileButton.type = "button";
saveProfileButton.className = "primary-button";
saveProfileButton.textContent = "SAVE MY PROFILE →";

saveProfileButton.style.margin = "0 10px 12px 0";

resultStep.insertBefore(saveProfileButton, editProfileButton);

// Status

resultNotice.setAttribute("role", "status");
resultNotice.setAttribute("aria-live", "polite");

function showSaveStatus(message) {
  resultNotice.textContent = message;
}

// Steps

function showStep(step) {
  genresStep.hidden = step !== "genres";
  contentStep.hidden = step !== "content";
  resultStep.hidden = step !== "result";

  const percent = step === "genres" ? 50 : 100;

  progressText.textContent = step === "genres" ? "Step 1 of 2" : "Step 2 of 2";

  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Genre Selection

function updateGenreSelection() {
  const count = selectedGenres.size;

  genreCounter.textContent = `${count} of ${MAX_GENRES} selected`;

  genresNextButton.disabled = count < MIN_GENRES || count > MAX_GENRES;

  genreGrid.querySelectorAll(".genre-chip").forEach((button) => {
    const isSelected = selectedGenres.has(button.dataset.genreId);

    button.classList.toggle("selected", isSelected);

    button.setAttribute("aria-pressed", String(isSelected));
  });
}

// Genre Buttons

function renderGenres(genres) {
  genreGrid.replaceChildren();

  genres.forEach((genre) => {
    const id = String(genre.id);

    availableGenres.set(id, genre.name);

    const button = document.createElement("button");

    button.type = "button";
    button.className = "genre-chip";
    button.dataset.genreId = id;
    button.textContent = genre.name;

    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      if (selectedGenres.has(id)) {
        selectedGenres.delete(id);
      } else if (selectedGenres.size < MAX_GENRES) {
        selectedGenres.add(id);
      }

      updateGenreSelection();
    });

    genreGrid.append(button);
  });

  updateGenreSelection();
}

// Load Options

async function loadOnboardingOptions() {
  genreStatus.textContent = "Loading genres...";
  genresNextButton.disabled = true;

  try {
    const response = await fetch("/api/compass/onboarding/options", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.status === 401) {
      throw new Error("Please log in to My List to continue.");
    }

    if (!response.ok) {
      throw new Error("Unable to load your onboarding options.");
    }

    const data = await response.json();

    if (!Array.isArray(data.genres)) {
      throw new Error("Invalid server response.");
    }

    availableGenres.clear();
    selectedGenres.clear();

    renderGenres(data.genres);

    // Saved Genres

    const savedIds = data.preferences?.preferred_genre_ids || [];

    if (Array.isArray(savedIds)) {
      savedIds.forEach((id) => {
        const genreId = String(id);

        if (availableGenres.has(genreId) && selectedGenres.size < MAX_GENRES) {
          selectedGenres.add(genreId);
        }
      });
    }

    // Saved Content Type

    const savedType = data.preferences?.preferred_content_type;

    document.querySelectorAll('input[name="content_type"]').forEach((input) => {
      input.checked = input.value === savedType;
    });

    contentNextButton.disabled = !Object.hasOwn(contentLabels, savedType);

    updateGenreSelection();

    const completed = data.preferences?.onboarding_completed === true;

    genreStatus.textContent = completed
      ? `${availableGenres.size} genres available. ` +
        "Your saved preferences have been loaded."
      : `${availableGenres.size} genres available.`;
  } catch (error) {
    console.error("Onboarding loading error:", error);

    genreStatus.textContent = error.message;
    genresNextButton.disabled = true;
  }
}

// Content Selection

document.querySelectorAll('input[name="content_type"]').forEach((input) => {
  input.addEventListener("change", () => {
    contentNextButton.disabled = false;
  });
});

// Navigation

genresNextButton.addEventListener("click", () => {
  if (selectedGenres.size < MIN_GENRES || selectedGenres.size > MAX_GENRES) {
    return;
  }

  showStep("content");
});

contentBackButton.addEventListener("click", () => {
  showStep("genres");
});

// Profile Preview

contentNextButton.addEventListener("click", () => {
  const selectedContent = document.querySelector(
    'input[name="content_type"]:checked',
  );

  if (
    !selectedContent ||
    !Object.hasOwn(contentLabels, selectedContent.value)
  ) {
    return;
  }

  selectedGenresContainer.replaceChildren();

  selectedGenres.forEach((id) => {
    const chip = document.createElement("span");

    chip.className = "selected-genre";
    chip.textContent = availableGenres.get(id);

    selectedGenresContainer.append(chip);
  });

  selectedContentElement.textContent = contentLabels[selectedContent.value];

  saveProfileButton.disabled = false;
  saveProfileButton.textContent = "SAVE MY PROFILE →";

  showSaveStatus(
    "Your current choices have not been saved yet. " +
      "Click SAVE MY PROFILE to update your preferences.",
  );

  showStep("result");
});

// Edit Profile

editProfileButton.addEventListener("click", () => {
  if (isSaving) {
    return;
  }

  showStep("genres");
});

// Save Profile

saveProfileButton.addEventListener("click", async () => {
  if (isSaving) {
    return;
  }

  const selectedContent = document.querySelector(
    'input[name="content_type"]:checked',
  );

  if (
    !selectedContent ||
    !Object.hasOwn(contentLabels, selectedContent.value)
  ) {
    showSaveStatus("Please select a content type.");
    return;
  }

  if (selectedGenres.size < MIN_GENRES || selectedGenres.size > MAX_GENRES) {
    showSaveStatus("Please select 3 to 5 genres.");
    return;
  }

  const payload = {
    preferred_content_type: selectedContent.value,
    genre_ids: [...selectedGenres],
  };

  isSaving = true;

  saveProfileButton.disabled = true;
  editProfileButton.disabled = true;

  saveProfileButton.textContent = "SAVING...";

  showSaveStatus("Saving your preferences to MyList Compass...");

  try {
    const response = await fetch("/api/compass/onboarding", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "same-origin",

      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok) {
      throw new Error(data?.message || "Unable to save your preferences.");
    }

    if (
      data?.saved !== true ||
      data?.preferences?.onboarding_completed !== true
    ) {
      throw new Error("Unexpected response from the server.");
    }

    saveProfileButton.textContent = "SAVED ✓";

    showSaveStatus(
      "Your Compass profile has been saved successfully! " +
        "Your favorite genres and content preferences " +
        "are now stored in PostgreSQL.",
    );

    console.log("MyList Compass: profile saved.", data.preferences);
  } catch (error) {
    console.error("Onboarding save error:", error);

    saveProfileButton.textContent = "TRY AGAIN →";

    showSaveStatus(
      `Your changes were not confirmed as saved. ${error.message}`,
    );
  } finally {
    isSaving = false;
    saveProfileButton.disabled = false;
    editProfileButton.disabled = false;
  }
});

// Initialization

loadOnboardingOptions();
