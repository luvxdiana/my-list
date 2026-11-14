// Localized interface text
const annotationPageText = (value) => {
  const key = window.MyListPageTextKeys?.[String(value)];
  return key ? window.MyListI18n.t(key) : value;
};

// Elements

const annotationForm = document.getElementById("annotation-form");
const mediaSelect = document.getElementById("media-title");
const emotionFields = document.getElementById("emotion-fields");
const annotationPreview = document.getElementById("annotation-preview");
const annotationSubmitButton = annotationForm.querySelector(
  'button[type="submit"]',
);

// Catalog

const mediaCatalog = new Map();

mediaSelect.name = "media_id";

// Emotions

const emotions = [
  {
    code: "joy",
    name: annotationPageText("Joy"),
    icon: "😊",
    description: annotationPageText("Happiness, amusement, delight"),
  },
  {
    code: "comfort",
    name: annotationPageText("Comfort"),
    icon: "💜",
    description: annotationPageText("Warmth, reassurance, emotional safety"),
  },
  {
    code: "calm",
    name: annotationPageText("Peace"),
    icon: "🌙",
    description: annotationPageText("Relaxation, tranquility, reduced tension"),
  },
  {
    code: "inspiration",
    name: annotationPageText("Inspiration"),
    icon: "✨",
    description: annotationPageText("Motivation, hope, encouragement"),
  },
  {
    code: "thrill",
    name: annotationPageText("Excitement"),
    icon: "⚡",
    description: annotationPageText("Suspense, anticipation, excitement"),
  },
  {
    code: "energy",
    name: annotationPageText("Energy"),
    icon: "🔥",
    description: annotationPageText("Stimulation, enthusiasm, activation"),
  },
];

// Catalog Messages

function setCatalogMessage(message) {
  mediaSelect.replaceChildren(new Option(message, ""));

  mediaSelect.disabled = true;
}

// Load Catalog

async function loadMediaCatalog() {
  setCatalogMessage(annotationPageText("Loading titles..."));

  try {
    const response = await fetch("/api/compass/catalog", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.status === 401) {
      throw new Error(
        annotationPageText("Please log in to My List to load the catalog."),
      );
    }

    if (!response.ok) {
      throw new Error(annotationPageText("Unable to load the media catalog."));
    }

    const data = await response.json();

    if (!Array.isArray(data.media)) {
      throw new Error(annotationPageText("Invalid catalog response."));
    }

    mediaCatalog.clear();

    mediaSelect.replaceChildren(
      new Option(annotationPageText("Select a title"), ""),
    );

    data.media.forEach((media) => {
      if (media.id == null || typeof media.title !== "string") {
        return;
      }

      const id = String(media.id);

      mediaCatalog.set(id, media);

      const type = media.category === "series" ? "Series" : "Movie";

      const year = media.release_year ? ` · ${media.release_year}` : "";

      mediaSelect.append(new Option(`${media.title} (${type}${year})`, id));
    });

    if (mediaCatalog.size === 0) {
      setCatalogMessage(annotationPageText("No titles available"));
      return;
    }

    mediaSelect.disabled = false;

    console.log(`MyList Compass: ${mediaCatalog.size} titles loaded.`);
  } catch (error) {
    console.error("Catalog loading error:", error);

    setCatalogMessage(error.message);
  }
}

// Select

function createSelect(id, name, options) {
  const select = document.createElement("select");

  select.id = id;
  select.name = name;
  select.required = true;

  select.append(new Option(annotationPageText("Select a value"), ""));

  options.forEach((option) => {
    select.append(new Option(option.label, String(option.value)));
  });

  return select;
}

// Emotion Fields

emotions.forEach((emotion) => {
  const card = document.createElement("fieldset");
  card.className = "emotion-card";

  const legend = document.createElement("legend");
  legend.textContent = `${emotion.icon} ${emotion.name}`;

  const description = document.createElement("p");
  description.className = "emotion-description";
  description.textContent = emotion.description;

  const intensityLabel = document.createElement("label");
  intensityLabel.htmlFor = `intensity-${emotion.code}`;
  intensityLabel.textContent = annotationPageText("Intensity");

  const intensitySelect = createSelect(
    `intensity-${emotion.code}`,
    `intensity_${emotion.code}`,
    [
      { value: 0, label: annotationPageText("0 — None") },
      { value: 1, label: annotationPageText("1 — Weak") },
      { value: 2, label: annotationPageText("2 — Moderate") },
      { value: 3, label: annotationPageText("3 — Strong") },
    ],
  );

  const confidenceLabel = document.createElement("label");
  confidenceLabel.htmlFor = `confidence-${emotion.code}`;
  confidenceLabel.textContent = annotationPageText("Confidence");

  const confidenceSelect = createSelect(
    `confidence-${emotion.code}`,
    `confidence_${emotion.code}`,
    [
      { value: 1, label: annotationPageText("1 — Low") },
      { value: 2, label: annotationPageText("2 — Medium") },
      { value: 3, label: annotationPageText("3 — High") },
    ],
  );

  card.append(
    legend,
    description,
    intensityLabel,
    intensitySelect,
    confidenceLabel,
    confidenceSelect,
  );

  emotionFields.append(card);
});

// Result Messages

function showAnnotationMessage(title, messages) {
  const heading = document.createElement("h2");
  heading.textContent = title;

  annotationPreview.replaceChildren(heading);

  messages.forEach((message) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    annotationPreview.append(paragraph);
  });

  annotationPreview.hidden = false;

  annotationPreview.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Prepare Ratings

function readRating(formData, fieldName) {
  const value = formData.get(fieldName);

  if (value === null || value === "") {
    return null;
  }

  return Number(value);
}

function buildAnnotationPayload(formData) {
  return {
    media_id: String(formData.get("media_id") || ""),

    evidence_source: formData.get("evidence_source"),

    annotation_note: String(formData.get("annotation_note") || ""),

    ratings: emotions.map((emotion) => ({
      emotion_code: emotion.code,

      intensity: readRating(formData, `intensity_${emotion.code}`),

      confidence: readRating(formData, `confidence_${emotion.code}`),
    })),
  };
}

// Show Validated Preview

function showAnnotationPreview(payload) {
  const media = mediaCatalog.get(payload.media_id);

  const heading = document.createElement("h2");
  heading.textContent = annotationPageText("Annotation Preview ✦");

  const mediaInfo = document.createElement("p");
  mediaInfo.textContent = `Media: ${media.title}`;

  const mediaIdInfo = document.createElement("p");
  mediaIdInfo.textContent = `Catalog ID: ${media.id}`;

  const sourceInfo = document.createElement("p");
  sourceInfo.textContent = `Evidence source: ${payload.evidence_source}`;

  const validationInfo = document.createElement("p");
  validationInfo.textContent = annotationPageText(
    "Server validation: Passed ✓",
  );

  const table = document.createElement("table");
  table.className = "results-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  [
    annotationPageText("Emotion"),
    annotationPageText("Intensity"),
    annotationPageText("Confidence"),
  ].forEach((text) => {
    const th = document.createElement("th");

    th.textContent = text;
    headerRow.append(th);
  });

  thead.append(headerRow);

  const tbody = document.createElement("tbody");

  payload.ratings.forEach((rating) => {
    const row = document.createElement("tr");

    const emotion = emotions.find((item) => item.code === rating.emotion_code);

    const values = [emotion.name, rating.intensity, rating.confidence];

    values.forEach((value) => {
      const cell = document.createElement("td");

      cell.textContent = String(value);
      row.append(cell);
    });

    tbody.append(row);
  });

  table.append(thead, tbody);

  const notice = document.createElement("p");
  notice.className = "results-notice";

  notice.textContent =
    "Preview only. Your answers passed server validation " +
    "but have not been saved.";

  annotationPreview.replaceChildren(
    heading,
    mediaInfo,
    mediaIdInfo,
    sourceInfo,
    validationInfo,
    table,
    notice,
  );

  annotationPreview.hidden = false;

  annotationPreview.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Submit Annotation Preview

annotationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(annotationForm);

  const payload = buildAnnotationPayload(formData);

  if (!mediaCatalog.has(payload.media_id)) {
    showAnnotationMessage(annotationPageText("Invalid selection"), [
      annotationPageText("Please select a media item from the catalog."),
    ]);

    return;
  }

  annotationSubmitButton.disabled = true;
  annotationSubmitButton.textContent = "CHECKING...";

  try {
    const response = await fetch("/api/research/annotations/preview-check", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "same-origin",

      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.status === 400) {
      showAnnotationMessage(
        annotationPageText("Please check your answers"),
        Array.isArray(data?.errors)
          ? data.errors
          : [annotationPageText("Invalid annotation data.")],
      );

      return;
    }

    if (response.status === 401) {
      throw new Error(
        annotationPageText("Your session has expired. Please log in again."),
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          annotationPageText("Unable to validate your annotation."),
      );
    }

    if (
      data?.valid !== true ||
      data?.saved !== false ||
      data?.preview_only !== true
    ) {
      throw new Error(annotationPageText("Unexpected validation response."));
    }

    showAnnotationPreview(payload);
  } catch (error) {
    console.error("Annotation validation error:", error);

    showAnnotationMessage(annotationPageText("Validation unavailable"), [
      error.message || annotationPageText("Please try again."),
    ]);
  } finally {
    annotationSubmitButton.disabled = false;
    annotationSubmitButton.textContent = "CHECK ANSWERS →";
  }
});

// Reset

annotationForm.addEventListener("reset", () => {
  annotationPreview.hidden = true;
});

annotationForm.addEventListener("change", () => {
  annotationPreview.hidden = true;
});

// Initialization

loadMediaCatalog();
