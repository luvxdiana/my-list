const onboardingT = (key, params) =>
  window.MyListI18n?.t(`onboarding.${key}`, params) ?? key;
const onboardingGenreLabel = (name) => {
  const key = `genre.${name}`;
  const translated = window.MyListI18n?.t(key) ?? key;
  return translated === key ? name : translated;
};

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

const contentLabels = { movie: "movie", series: "series", either: "either" };
const contentLabel = (value) => onboardingT(`contentLabel.${value}`);

let isSaving = false;

// Page Information

if (previewNotice) {
  previewNotice.textContent = onboardingT("saveWarning");
}

if (previewBadge) {
  previewBadge.textContent = onboardingT("profileSetup");
}

// Save Button

const saveProfileButton = document.createElement("button");

saveProfileButton.id = "save-profile-btn";
saveProfileButton.type = "button";
saveProfileButton.className = "primary-button";
saveProfileButton.textContent = onboardingT("saveButton");

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

  progressText.textContent =
    step === "genres" ? onboardingT("step1") : onboardingT("step2");

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

  genreCounter.textContent = onboardingT("counter", { count, max: MAX_GENRES });

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
    button.textContent = onboardingGenreLabel(genre.name);

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
  genreStatus.textContent = onboardingT("loading");
  genresNextButton.disabled = true;

  try {
    const response = await fetch("/api/compass/onboarding/options", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.status === 401) {
      throw new Error(onboardingT("loginRequired"));
    }

    if (!response.ok) {
      throw new Error(onboardingT("loadFailed"));
    }

    const data = await response.json();

    if (!Array.isArray(data.genres)) {
      throw new Error(onboardingT("invalidResponse"));
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
      ? onboardingT("loadedPreferences", { count: availableGenres.size })
      : onboardingT("availableGenres", { count: availableGenres.size });
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
    chip.textContent = onboardingGenreLabel(availableGenres.get(id));

    selectedGenresContainer.append(chip);
  });

  selectedContentElement.textContent = contentLabel(selectedContent.value);

  saveProfileButton.disabled = false;
  saveProfileButton.textContent = onboardingT("saveButton");

  showSaveStatus(onboardingT("unsavedNotice"));

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
    showSaveStatus(onboardingT("selectContent"));
    return;
  }

  if (selectedGenres.size < MIN_GENRES || selectedGenres.size > MAX_GENRES) {
    showSaveStatus(onboardingT("selectGenres"));
    return;
  }

  const payload = {
    preferred_content_type: selectedContent.value,
    genre_ids: [...selectedGenres],
  };

  isSaving = true;

  saveProfileButton.disabled = true;
  editProfileButton.disabled = true;

  saveProfileButton.textContent = onboardingT("savingButton");

  showSaveStatus(onboardingT("savingNotice"));

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
      throw new Error(onboardingT("expired"));
    }

    if (!response.ok) {
      throw new Error(data?.message || onboardingT("saveFailed"));
    }

    if (
      data?.saved !== true ||
      data?.preferences?.onboarding_completed !== true
    ) {
      throw new Error(onboardingT("unexpectedResponse"));
    }

    saveProfileButton.textContent = onboardingT("savedButton");

    showSaveStatus(onboardingT("savedNotice"));

    console.log("MyList Compass: profile saved.", data.preferences);

    // Continue to My List after confirmed save
    window.setTimeout(() => {
      window.location.replace("/dashboard.html?category=anime");
    }, 900);
  } catch (error) {
    console.error("Onboarding save error:", error);

    saveProfileButton.textContent = onboardingT("retry");

    showSaveStatus(onboardingT("unconfirmed", { error: error.message }));
  } finally {
    isSaving = false;
    saveProfileButton.disabled = false;
    editProfileButton.disabled = false;
  }
});

// Initialization

loadOnboardingOptions();

// Language changes

function refreshOnboardingLanguage() {
  previewNotice.textContent = onboardingT("saveWarning");
  previewBadge.textContent = onboardingT("profileSetup");
  progressText.textContent = genresStep.hidden
    ? onboardingT("step2")
    : onboardingT("step1");
  updateGenreSelection();
  genreGrid.querySelectorAll(".genre-chip").forEach((button) => {
    button.textContent = onboardingGenreLabel(
      availableGenres.get(button.dataset.genreId),
    );
  });
  selectedGenresContainer
    .querySelectorAll(".selected-genre")
    .forEach((chip, index) => {
      const id = [...selectedGenres][index];
      chip.textContent = onboardingGenreLabel(availableGenres.get(id));
    });
  const content = document.querySelector('input[name="content_type"]:checked');
  if (content && !resultStep.hidden)
    selectedContentElement.textContent = contentLabel(content.value);
  if (!isSaving && !resultStep.hidden) {
    saveProfileButton.textContent = onboardingT("saveButton");
    // Do not overwrite saved/unsaved status, which may contain useful API errors.
  }
}

document.addEventListener("mylist:languagechange", refreshOnboardingLanguage);
