// Localized interface text
const catalogPageText = (value) => {
  const key = window.MyListPageTextKeys?.[String(value)];
  return key ? window.MyListI18n.t(key) : value;
};

// Catalog Administration

const accessStatus = document.getElementById("access-status");
const adminPanel = document.getElementById("admin-panel");

const searchForm = document.getElementById("tmdb-search-form");
const mediaType = document.getElementById("media-type");
const searchQuery = document.getElementById("search-query");
const searchButton = document.getElementById("search-button");
const searchStatus = document.getElementById("search-status");

const resultsSection = document.getElementById("search-results-section");

const resultsContainer = document.getElementById("search-results");

const previewSection = document.getElementById("media-preview-section");

const mediaDetails = document.getElementById("media-details");
const matchDetails = document.getElementById("match-details");

let selectedMedia = null;
let importInProgress = false;
let reviewVersion = 0;

// API Helper

async function getApiData(url) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

// Display Helpers

function createParagraph(text) {
  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  return paragraph;
}

function addDetail(container, label, value) {
  const row = document.createElement("p");
  row.className = "media-detail-row";

  const strong = document.createElement("strong");
  strong.textContent = `${label}: `;

  row.append(strong, document.createTextNode(String(value ?? "Unknown")));

  container.append(row);
}

// Import Interface

const importPanel = document.createElement("div");
importPanel.className = "status-box";
importPanel.style.marginTop = "24px";
importPanel.hidden = true;

const importHeading = document.createElement("h3");
importHeading.textContent = catalogPageText("Import to Catalog");

const importDescription = createParagraph(
  "This action creates a new media record in PostgreSQL. " +
    "Genres will be linked, but emotional assessments will not be created.",
);

const importLabel = document.createElement("label");
importLabel.textContent = "Type IMPORT to confirm: ";
importLabel.htmlFor = "import-confirmation";

const importInput = document.createElement("input");
importInput.id = "import-confirmation";
importInput.type = "text";
importInput.placeholder = "IMPORT";
importInput.autocomplete = "off";
importInput.spellcheck = false;
importInput.style.margin = "12px 12px 12px 0";
importInput.style.maxWidth = "180px";

const importButton = document.createElement("button");
importButton.type = "button";
importButton.textContent = catalogPageText("Import to Catalog");
importButton.disabled = true;

const importStatus = createParagraph("");
importStatus.setAttribute("role", "status");

importLabel.append(importInput);

importPanel.append(
  importHeading,
  importDescription,
  importLabel,
  importButton,
  importStatus,
);

const reviewNotice = createParagraph("");
reviewNotice.setAttribute("role", "status");

previewSection.append(reviewNotice, importPanel);

// Preview Warning

const previewWarning = previewSection.querySelector(".preview-warning");

if (previewWarning) {
  previewWarning.textContent =
    "Reviewing media does not change PostgreSQL. " +
    "A confirmed import creates a new catalog record.";
}

// Import Button State

function updateImportButton() {
  importButton.disabled =
    importInProgress ||
    selectedMedia === null ||
    importInput.value.trim() !== "IMPORT";
}

importInput.addEventListener("input", updateImportButton);

// Administrator Access

async function checkAdministratorAccess() {
  try {
    const data = await getApiData("/api/catalog-admin/check");

    if (data.is_admin !== true) {
      throw new Error(catalogPageText("Administrator access required."));
    }

    accessStatus.textContent = catalogPageText(
      "Administrator access granted. Catalog tools are available.",
    );

    adminPanel.hidden = false;
    loadAnnotationOptions();
  } catch (error) {
    accessStatus.textContent = error.message;
    accessStatus.classList.add("status-error");

    adminPanel.hidden = true;
  }
}

// Search Results

function displaySearchResults(results, type) {
  resultsContainer.replaceChildren();

  if (results.length === 0) {
    resultsContainer.append(
      createParagraph(catalogPageText("No results found.")),
    );

    resultsSection.hidden = false;
    return;
  }

  for (const media of results) {
    const item = document.createElement("div");
    item.className = "media-result";

    const information = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = media.title;

    const metadata = createParagraph(
      `${media.release_year ?? catalogPageText("Unknown year")} · ` +
        `TMDB ID: ${media.tmdb_id}`,
    );

    information.append(title, metadata);

    const button = document.createElement("button");

    button.type = "button";
    button.className = "secondary-button";
    button.textContent = catalogPageText("Review");

    button.addEventListener("click", () => {
      reviewMedia(type, media.tmdb_id);
    });

    item.append(information, button);
    resultsContainer.append(item);
  }

  resultsSection.hidden = false;
}

// Search TMDB

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (importInProgress) {
    return;
  }

  const type = mediaType.value;
  const query = searchQuery.value.trim();

  if (query.length < 2 || query.length > 100) {
    searchStatus.textContent = catalogPageText(
      "Enter a title containing 2–100 characters.",
    );
    return;
  }

  reviewVersion++;
  selectedMedia = null;

  searchButton.disabled = true;
  searchStatus.textContent = catalogPageText("Searching TMDB...");

  resultsSection.hidden = true;
  previewSection.hidden = true;
  importPanel.hidden = true;

  try {
    const params = new URLSearchParams({
      type,
      q: query,
    });

    const data = await getApiData(`/api/tmdb/search?${params}`);

    if (!Array.isArray(data.results)) {
      throw new Error(catalogPageText("Unexpected search response."));
    }

    displaySearchResults(data.results, type);

    searchStatus.textContent =
      `Found ${data.total_results} results. ` +
      `Showing ${data.count} on the first page.`;
  } catch (error) {
    searchStatus.textContent = error.message;
  } finally {
    searchButton.disabled = false;
  }
});

// Review Media

async function reviewMedia(type, tmdbId) {
  if (importInProgress) {
    return;
  }

  const currentVersion = ++reviewVersion;

  selectedMedia = null;

  previewSection.hidden = false;
  importPanel.hidden = true;

  importInput.value = "";
  importStatus.textContent = "";
  reviewNotice.textContent = "";

  updateImportButton();

  mediaDetails.replaceChildren(
    createParagraph(catalogPageText("Loading media details...")),
  );

  matchDetails.replaceChildren();

  try {
    const params = new URLSearchParams({
      type,
      id: String(tmdbId),
    });

    const [details, match] = await Promise.all([
      getApiData(`/api/tmdb/details?${params}`),
      getApiData(`/api/tmdb/match?${params}`),
    ]);

    if (currentVersion !== reviewVersion) {
      return;
    }

    const media = details.media;

    if (
      !media ||
      !Array.isArray(media.genres) ||
      !Array.isArray(match.candidates)
    ) {
      throw new Error(catalogPageText("Unexpected media review response."));
    }

    // Media Details

    mediaDetails.replaceChildren();

    addDetail(mediaDetails, "Title", media.title);
    addDetail(mediaDetails, "Category", media.category);
    addDetail(mediaDetails, catalogPageText("Year"), media.release_year);

    addDetail(
      mediaDetails,
      catalogPageText("Duration"),
      media.duration_minutes ? `${media.duration_minutes} minutes` : "Unknown",
    );

    addDetail(
      mediaDetails,
      catalogPageText("Genres"),
      media.genres.map((genre) => genre.name).join(", "),
    );

    addDetail(
      mediaDetails,
      catalogPageText("Description"),
      media.description || catalogPageText("No description"),
    );

    addDetail(mediaDetails, "TMDB ID", media.tmdb_id);

    // Catalog Matching

    addDetail(
      matchDetails,
      catalogPageText("Match status"),
      match.match_status,
    );

    addDetail(
      matchDetails,
      catalogPageText("Title variants checked"),
      match.title_variants_checked,
    );

    if (match.candidates.length === 0) {
      matchDetails.append(
        createParagraph(
          catalogPageText("No matching entries found in the local catalog."),
        ),
      );
    } else {
      for (const candidate of match.candidates) {
        const item = document.createElement("div");
        item.className = "match-candidate";

        addDetail(item, catalogPageText("Local ID"), candidate.media_id);
        addDetail(item, "Title", candidate.title);
        addDetail(item, "Reason", candidate.match_reason);

        matchDetails.append(item);
      }
    }

    // Import Eligibility

    const canOfferImport =
      match.match_status === "new_candidate" &&
      match.candidates.length === 0 &&
      media.tmdb_id === tmdbId &&
      media.category === type &&
      typeof media.title === "string" &&
      media.title.trim().length > 0 &&
      Number.isInteger(media.release_year) &&
      Number.isInteger(media.duration_minutes) &&
      media.duration_minutes > 0 &&
      media.genres.length > 0;

    if (canOfferImport) {
      selectedMedia = {
        type,
        tmdbId,
        title: media.title,
        year: media.release_year,
      };

      importPanel.hidden = false;

      importStatus.textContent = catalogPageText(
        "Candidate for import. Final checks will run on the server.",
      );
    } else if (match.match_status === "already_linked") {
      reviewNotice.textContent =
        "This media is already linked to MyList. " + "Import is unavailable.";
    } else {
      reviewNotice.textContent =
        "Import is unavailable. This media requires " +
        "additional verification or has incomplete metadata.";
    }

    updateImportButton();

    previewSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    if (currentVersion !== reviewVersion) {
      return;
    }

    selectedMedia = null;
    importPanel.hidden = true;

    mediaDetails.replaceChildren(createParagraph(error.message));
  }
}

// Import Media

async function importSelectedMedia() {
  if (
    importInProgress ||
    selectedMedia === null ||
    importInput.value.trim() !== "IMPORT"
  ) {
    return;
  }

  const media = { ...selectedMedia };

  importInProgress = true;

  importButton.disabled = true;
  importInput.disabled = true;
  searchButton.disabled = true;

  importStatus.textContent = catalogPageText(
    "Importing media into PostgreSQL...",
  );

  try {
    const response = await fetch("/api/catalog-admin/import", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "same-origin",

      body: JSON.stringify({
        type: media.type,
        tmdb_id: media.tmdbId,
        expected_title: media.title,
        expected_year: media.year,
        confirm_import: "IMPORT",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      selectedMedia = null;
      importPanel.hidden = true;

      reviewNotice.textContent = `Import blocked: ${
        result.message || `HTTP ${response.status}`
      }. Refresh the review before trying again.`;

      return;
    }

    // Verify Import Response

    const validResponse =
      response.status === 201 &&
      result.saved === true &&
      result.emotions_created === false &&
      result.media?.tmdb_id === media.tmdbId &&
      result.media?.category === media.type;

    if (!validResponse) {
      selectedMedia = null;
      importPanel.hidden = true;

      reviewNotice.textContent =
        "Unexpected import response. Verify the database " +
        "before attempting another import.";

      return;
    }

    const importedId = result.media.id;

    selectedMedia = null;

    // Refresh Matching

    await reviewMediaAfterImport(media.type, media.tmdbId);

    reviewNotice.textContent =
      `Successfully imported ${media.title}. ` +
      `MyList ID: ${importedId}. ` +
      `No emotional assessments were created.`;

    annotationMediaId.value = String(importedId);
    annotationLoadStatus.textContent =
      "Imported successfully. Load this ID below when you have a defensible annotation basis.";
    annotationSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    selectedMedia = null;
    importPanel.hidden = true;

    reviewNotice.textContent =
      "Import result could not be confirmed. " +
      "Check PostgreSQL before attempting another import.";

    console.error("Catalog import error:", error);
  } finally {
    importInProgress = false;

    importInput.disabled = false;
    searchButton.disabled = false;

    updateImportButton();
  }
}

// Refresh After Import

async function reviewMediaAfterImport(type, tmdbId) {
  importInProgress = false;

  try {
    await reviewMedia(type, tmdbId);
  } finally {
    importInProgress = true;
  }
}

// Events

importButton.addEventListener("click", importSelectedMedia);

// Initialization

checkAdministratorAccess();

// Emotional Annotation

const annotationSection = document.getElementById("annotation-section");
const annotationLoadForm = document.getElementById("annotation-load-form");
const annotationMediaId = document.getElementById("annotation-media-id");
const annotationLoadButton = document.getElementById("annotation-load-button");
const annotationLoadStatus = document.getElementById("annotation-load-status");
const annotationEditor = document.getElementById("annotation-editor");
const annotationMediaTitle = document.getElementById("annotation-media-title");
const annotationMediaMeta = document.getElementById("annotation-media-meta");
const annotationLockedNotice = document.getElementById(
  "annotation-locked-notice",
);
const annotationSaveForm = document.getElementById("annotation-save-form");
const annotationEmotionOptions = document.getElementById(
  "annotation-emotion-options",
);
const annotationConfirm = document.getElementById("annotation-confirm");
const annotationSaveButton = document.getElementById("annotation-save-button");
const annotationSaveStatus = document.getElementById("annotation-save-status");

let annotationOptions = [];
let annotationSelected = null;
let annotationLoading = false;
let annotationSaving = false;
let annotationRequestVersion = 0;

async function loadAnnotationOptions() {
  try {
    const data = await getApiData("/api/catalog-admin/annotation-options");
    if (
      !Array.isArray(data.emotions) ||
      data.emotions.length !== 6 ||
      data.emotions.some(
        (emotion) =>
          typeof emotion.code !== "string" || typeof emotion.name !== "string",
      )
    ) {
      throw new Error("Unexpected emotion options response.");
    }
    annotationOptions = data.emotions;
  } catch (error) {
    annotationLoadStatus.textContent = `Emotion options unavailable: ${error.message}`;
  }
}

function updateAnnotationSaveButton() {
  const chosen = annotationEmotionOptions.querySelectorAll(
    'input[type="checkbox"]:checked',
  ).length;
  annotationSaveButton.disabled =
    annotationSaving ||
    annotationLoading ||
    !annotationSelected?.canEdit ||
    !annotationConfirm.checked ||
    chosen < 1 ||
    chosen > 6;
}

function renderAnnotationOptions(selectedCodes) {
  annotationEmotionOptions.replaceChildren();
  for (const emotion of annotationOptions) {
    const label = document.createElement("label");
    label.className = "annotation-emotion";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = emotion.code;
    input.checked = selectedCodes.has(emotion.code);
    input.addEventListener("change", updateAnnotationSaveButton);
    const caption = document.createElement("span");
    caption.textContent = `${emotion.name} · ${emotion.code}`;
    label.append(input, caption);
    annotationEmotionOptions.append(label);
  }
}

async function loadMediaAnnotations(mediaId) {
  const requestVersion = ++annotationRequestVersion;
  annotationLoading = true;
  annotationSelected = null;
  annotationEditor.hidden = true;
  annotationLoadButton.disabled = true;
  annotationLoadStatus.textContent = "Завантаження / Loading…";

  try {
    if (!annotationOptions.length) await loadAnnotationOptions();
    if (!annotationOptions.length)
      throw new Error("Emotion dictionary is unavailable.");

    const data = await getApiData(
      `/api/catalog-admin/annotations/${encodeURIComponent(mediaId)}`,
    );
    if (requestVersion !== annotationRequestVersion) return;
    if (!data.media || !Array.isArray(data.emotions)) {
      throw new Error("Unexpected annotation response.");
    }

    annotationSelected = {
      id: String(data.media.id),
      canEdit: data.can_edit === true,
    };
    annotationMediaTitle.textContent = data.media.title;
    annotationMediaMeta.textContent = `${data.media.category} · MyList ID ${data.media.id} · TMDB ${data.media.tmdb_id ?? "—"}`;
    annotationConfirm.checked = false;
    annotationSaveStatus.textContent = "";
    annotationEditor.hidden = false;

    if (!data.can_edit) {
      annotationLockedNotice.hidden = false;
      annotationLockedNotice.textContent =
        "Ця розмітка захищена: вихідні дослідницькі або перевірені мітки не можна змінювати тут. / These annotations are protected.";
      annotationSaveForm.hidden = true;
    } else {
      annotationLockedNotice.hidden = true;
      annotationSaveForm.hidden = false;
      renderAnnotationOptions(
        new Set(data.emotions.map((emotion) => emotion.code)),
      );
    }
    annotationLoadStatus.textContent = "Дані завантажено / Loaded.";
  } catch (error) {
    if (requestVersion === annotationRequestVersion) {
      annotationLoadStatus.textContent = error.message;
    }
  } finally {
    if (requestVersion === annotationRequestVersion) {
      annotationLoading = false;
      annotationLoadButton.disabled = false;
      updateAnnotationSaveButton();
    }
  }
}

annotationLoadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const id = annotationMediaId.value.trim();
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    annotationLoadStatus.textContent = "Введи коректний ID / Enter a valid ID.";
    return;
  }
  loadMediaAnnotations(id);
});

annotationConfirm.addEventListener("change", updateAnnotationSaveButton);

annotationSaveForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (
    annotationSaving ||
    !annotationSelected?.canEdit ||
    !annotationConfirm.checked
  )
    return;
  const emotionCodes = Array.from(
    annotationEmotionOptions.querySelectorAll('input[type="checkbox"]:checked'),
    (input) => input.value,
  );
  if (!emotionCodes.length || emotionCodes.length > 6) return;

  const mediaId = annotationSelected.id;
  annotationSaving = true;
  annotationLoadButton.disabled = true;
  updateAnnotationSaveButton();
  annotationSaveStatus.textContent = "Збереження / Saving…";

  try {
    const response = await fetch(
      `/api/catalog-admin/annotations/${encodeURIComponent(mediaId)}`,
      {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion_codes: emotionCodes,
          confirm_annotation: "ANNOTATE_PROVISIONAL",
        }),
      },
    );
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.saved !== true) {
      throw new Error(data?.message || `HTTP ${response.status}`);
    }
    annotationSaveStatus.textContent =
      "Попередні мітки збережено. Твір тепер може брати участь у рекомендаціях Compass. / Saved: eligible for recommendations.";
    annotationConfirm.checked = false;
  } catch (error) {
    annotationSaveStatus.textContent = `Помилка / Error: ${error.message}`;
  } finally {
    annotationSaving = false;
    annotationLoadButton.disabled = false;
    updateAnnotationSaveButton();
  }
});
