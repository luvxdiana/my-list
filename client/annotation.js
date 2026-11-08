// Elements

const annotationForm = document.getElementById("annotation-form");
const mediaSelect = document.getElementById("media-title");
const emotionFields = document.getElementById("emotion-fields");
const annotationPreview = document.getElementById("annotation-preview");

// Catalog

const mediaCatalog = new Map();

mediaSelect.name = "media_id";

// Emotions

const emotions = [
  {
    code: "joy",
    name: "Joy",
    icon: "😊",
    description: "Happiness, amusement, delight",
  },
  {
    code: "comfort",
    name: "Comfort",
    icon: "💜",
    description: "Warmth, reassurance, emotional safety",
  },
  {
    code: "calm",
    name: "Peace",
    icon: "🌙",
    description: "Relaxation, tranquility, reduced tension",
  },
  {
    code: "inspiration",
    name: "Inspiration",
    icon: "✨",
    description: "Motivation, hope, encouragement",
  },
  {
    code: "thrill",
    name: "Excitement",
    icon: "⚡",
    description: "Suspense, anticipation, excitement",
  },
  {
    code: "energy",
    name: "Energy",
    icon: "🔥",
    description: "Stimulation, enthusiasm, activation",
  },
];

// Catalog Messages

function setCatalogMessage(message) {
  mediaSelect.replaceChildren(new Option(message, ""));

  mediaSelect.disabled = true;
}

// Load Catalog

async function loadMediaCatalog() {
  setCatalogMessage("Loading titles...");

  try {
    const response = await fetch("/api/compass/catalog", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.status === 401) {
      throw new Error("Please log in to My List to load the catalog.");
    }

    if (!response.ok) {
      throw new Error("Unable to load the media catalog.");
    }

    const data = await response.json();

    if (!Array.isArray(data.media)) {
      throw new Error("Invalid catalog response.");
    }

    mediaCatalog.clear();

    mediaSelect.replaceChildren(new Option("Select a title", ""));

    data.media.forEach((media) => {
      if (media.id == null || typeof media.title !== "string") {
        return;
      }

      const id = String(media.id);

      mediaCatalog.set(id, media);

      const type = media.category === "series" ? "Series" : "Movie";

      const year = media.release_year ? ` · ${media.release_year}` : "";

      const option = new Option(`${media.title} (${type}${year})`, id);

      mediaSelect.append(option);
    });

    if (mediaCatalog.size === 0) {
      setCatalogMessage("No titles available");
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

  select.append(new Option("Select a value", ""));

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
  intensityLabel.textContent = "Intensity";

  const intensitySelect = createSelect(
    `intensity-${emotion.code}`,
    `intensity_${emotion.code}`,
    [
      { value: 0, label: "0 — None" },
      { value: 1, label: "1 — Weak" },
      { value: 2, label: "2 — Moderate" },
      { value: 3, label: "3 — Strong" },
    ],
  );

  const confidenceLabel = document.createElement("label");
  confidenceLabel.htmlFor = `confidence-${emotion.code}`;
  confidenceLabel.textContent = "Confidence";

  const confidenceSelect = createSelect(
    `confidence-${emotion.code}`,
    `confidence_${emotion.code}`,
    [
      { value: 1, label: "1 — Low" },
      { value: 2, label: "2 — Medium" },
      { value: 3, label: "3 — High" },
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

// Preview Results

annotationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(annotationForm);

  const mediaId = formData.get("media_id");
  const source = formData.get("evidence_source");

  const media = mediaCatalog.get(String(mediaId));

  if (!media || !source) {
    return;
  }

  const heading = document.createElement("h2");
  heading.textContent = "Annotation Preview ✦";

  const mediaInfo = document.createElement("p");
  mediaInfo.textContent = `Media: ${media.title}`;

  const mediaIdInfo = document.createElement("p");
  mediaIdInfo.textContent = `Catalog ID: ${media.id}`;

  const sourceInfo = document.createElement("p");
  sourceInfo.textContent = `Evidence source: ${source}`;

  const table = document.createElement("table");
  table.className = "results-table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  ["Emotion", "Intensity", "Confidence"].forEach((text) => {
    const th = document.createElement("th");

    th.textContent = text;

    headerRow.append(th);
  });

  thead.append(headerRow);

  const tbody = document.createElement("tbody");

  emotions.forEach((emotion) => {
    const row = document.createElement("tr");

    const values = [
      emotion.name,
      formData.get(`intensity_${emotion.code}`),
      formData.get(`confidence_${emotion.code}`),
    ];

    values.forEach((value) => {
      const cell = document.createElement("td");

      cell.textContent = value;

      row.append(cell);
    });

    tbody.append(row);
  });

  table.append(thead, tbody);

  const note = document.createElement("p");
  note.className = "results-notice";

  note.textContent = "Preview only. Your answers have not been saved.";

  annotationPreview.replaceChildren(
    heading,
    mediaInfo,
    mediaIdInfo,
    sourceInfo,
    table,
    note,
  );

  annotationPreview.hidden = false;

  annotationPreview.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
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
