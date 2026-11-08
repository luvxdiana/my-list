// Elements

const annotationForm = document.getElementById("annotation-form");
const mediaSelect = document.getElementById("media-title");
const emotionFields = document.getElementById("emotion-fields");
const annotationPreview = document.getElementById("annotation-preview");

// Preview Catalog

const previewCatalog = [
  "A Quiet Place",
  "Coco",
  "Dark",
  "Friends",
  "Home Alone",
  "Inception",
  "Inside Out",
  "Interstellar",
  "Shrek",
  "The Bear",
  "The Conjuring",
  "The Good Place",
  "The Lion King",
  "The Matrix",
  "Titanic",
  "Toy Story",
];

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

// Catalog

previewCatalog.forEach((title) => {
  const option = document.createElement("option");

  option.value = title;
  option.textContent = title;

  mediaSelect.append(option);
});

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

  const title = formData.get("media_title");
  const source = formData.get("evidence_source");

  if (!previewCatalog.includes(title)) {
    return;
  }

  const heading = document.createElement("h2");
  heading.textContent = "Annotation Preview ✦";

  const mediaInfo = document.createElement("p");
  mediaInfo.textContent = `Media: ${title}`;

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
