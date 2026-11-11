// Compass Elements

const compassOpenButton = document.getElementById("open-compass-btn");
const compassCloseButton = document.getElementById("close-compass-btn");
const compassDialog = document.getElementById("compass-dialog");
const compassForm = document.getElementById("compass-form");
const compassPreview = document.getElementById("compass-preview");

const compassMascot = document.querySelector(".compass-mascot");
const compassFallback = document.querySelector(".compass-icon-fallback");

const compassSubmitButton = compassForm.querySelector('button[type="submit"]');

// Compass Labels

const compassLabels = {
  current_mood: {
    happy: "Happy",
    sad: "Sad",
    anxious: "Anxious",
    calm: "Calm",
    tired: "Tired",
    excited: "Excited",
  },

  desired_emotion: {
    joy: "Joy",
    comfort: "Comfort",
    calm: "Peace",
    inspiration: "Inspiration",
    thrill: "Excitement",
    energy: "Energy",
  },

  available_time: {
    30: "30 minutes",
    60: "1 hour",
    90: "1.5 hours",
    120: "2 hours",
    "180plus": "No time limit",
  },

  content_type: {
    movie: "Movie",
    series: "Series",
    either: "Movie or series",
  },
};

// Mascot

function showCompassFallback() {
  if (compassMascot) {
    compassMascot.hidden = true;
  }

  if (compassFallback) {
    compassFallback.hidden = false;
  }
}

if (compassMascot) {
  compassMascot.addEventListener("error", showCompassFallback);

  if (compassMascot.complete && compassMascot.naturalWidth === 0) {
    showCompassFallback();
  }
}

// Dialog

compassOpenButton.addEventListener("click", () => {
  compassPreview.hidden = true;

  if (!compassDialog.open) {
    compassDialog.showModal();
  }
});

compassCloseButton.addEventListener("click", () => {
  compassDialog.close();
});

compassDialog.addEventListener("click", (event) => {
  if (event.target !== compassDialog) {
    return;
  }

  const rect = compassDialog.getBoundingClientRect();

  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (outside) {
    compassDialog.close();
  }
});

compassForm.addEventListener("change", () => {
  compassPreview.hidden = true;
});

// Preview

function showCompassMessage(title, message) {
  const heading = document.createElement("h3");
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.textContent = message;

  compassPreview.replaceChildren(heading, paragraph);
  compassPreview.hidden = false;
}

// Recommendation Status

function getRecommendationStatus(data, count) {
  const expectedStatus =
    count === 0 ? "empty" : count < 3 ? "partial" : "complete";

  const validStatuses = new Set(["complete", "partial", "empty"]);

  if (
    validStatuses.has(data?.result_status) &&
    data.result_status === expectedStatus
  ) {
    return data.result_status;
  }

  return expectedStatus;
}

function getCompassSuggestion(preferences) {
  const limitedCoverage =
    "The current catalog has limited emotional tags for this choice.";

  if (
    preferences.content_type !== "either" &&
    preferences.available_time !== "180plus"
  ) {
    return (
      `${limitedCoverage} ` +
      "You can try 'Movie or series' or a longer time limit, " +
      "but these changes may not reveal additional matches."
    );
  }

  if (preferences.content_type !== "either") {
    return (
      `${limitedCoverage} ` +
      "Including both movies and series broadens the search, " +
      "but may not provide more recommendations."
    );
  }

  if (preferences.available_time !== "180plus") {
    return (
      `${limitedCoverage} ` +
      "A longer time limit may help, but additional emotional " +
      "annotations may still be needed."
    );
  }

  return (
    `${limitedCoverage} ` +
    "More recommendations may become available after " +
    "additional emotional annotations are reviewed."
  );
}

function createRecommendationStatus(data, preferences, count) {
  const status = getRecommendationStatus(data, count);

  const container = document.createElement("div");

  container.className = `compass-result-status compass-result-${status}`;

  container.style.cssText = `
    margin-top: 16px;
    padding: 16px 18px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.08);
  `;

  const title = document.createElement("h4");

  title.style.cssText = `
    margin: 0 0 8px;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
  `;

  const description = document.createElement("p");

  description.style.cssText = `
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
  `;

  if (status === "complete") {
    title.textContent = "Your matches are ready ✦";

    description.textContent =
      "We found 3 titles matching your selected preferences " +
      "using the current catalog tags.";
  }

  if (status === "partial") {
    title.textContent =
      count === 1 ? "1 recommendation found ✦" : "2 recommendations found ✦";

    description.textContent =
      "These are the available matches for your chosen " +
      "emotion, content type, and time limit. " +
      "We won't fill the remaining places with unrelated titles.";
  }

  if (status === "empty") {
    title.textContent = "No matches just yet ✦";

    description.textContent =
      "We couldn't find a title with the selected " +
      "emotional tag that also meets your content " +
      "and time preferences.";
  }

  container.append(title, description);

  if (status !== "complete") {
    const suggestion = document.createElement("p");

    suggestion.textContent = getCompassSuggestion(preferences);

    suggestion.style.cssText = `
      margin: 10px 0 0;
      font-size: 13px;
      line-height: 1.6;
      opacity: 0.85;
    `;

    container.append(suggestion);
  }

  return container;
}

// Recommendation Cards

function createRecommendationCard(media) {
  const card = document.createElement("article");

  card.style.cssText = `
    margin-top: 14px;
    padding: 18px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.10);
  `;

  const title = document.createElement("h4");

  title.textContent = `${media.position}. ${media.title}`;

  title.style.cssText = `
    margin: 0 0 8px;
    font-size: 19px;
    color: #ffffff;
  `;

  const details = document.createElement("p");

  const category = media.category === "series" ? "Series" : "Movie";

  const duration =
    media.category === "series"
      ? `${media.duration_minutes} min/episode`
      : `${media.duration_minutes} min`;

  details.textContent = [category, media.release_year, duration]
    .filter(Boolean)
    .join(" · ");

  details.style.cssText = `
    margin: 0 0 10px;
    font-size: 13px;
    opacity: 0.85;
  `;

  const genres = document.createElement("p");

  genres.textContent = Array.isArray(media.genres)
    ? `Genres: ${media.genres.join(", ")}`
    : "";

  genres.style.cssText = `
    margin: 0 0 10px;
    font-size: 14px;
  `;

  const reasons = document.createElement("p");

  reasons.textContent = Array.isArray(media.reasons)
    ? media.reasons.join(" · ")
    : "";

  reasons.style.cssText = `
    margin: 0 0 10px;
    font-size: 13px;
    opacity: 0.9;
  `;

  const score = document.createElement("p");

  const scoreValue = Number(media.score);

  score.textContent = Number.isFinite(scoreValue)
    ? `Prototype relevance score: ${scoreValue.toFixed(2)} / 1.00`
    : "Prototype relevance score unavailable";

  score.style.cssText = `
    margin: 0;
    font-size: 13px;
    font-weight: 600;
  `;

  card.append(title, details, genres, reasons, score);

  return card;
}

// Show Recommendations

function showRecommendations(data, preferences) {
  const recommendations = Array.isArray(data?.recommendations)
    ? data.recommendations
    : [];

  const heading = document.createElement("h3");

  heading.textContent = "Your Compass Recommendations ✦";

  const summary = document.createElement("p");

  summary.textContent =
    `${compassLabels.current_mood[preferences.current_mood]} → ` +
    `${compassLabels.desired_emotion[preferences.desired_emotion]} · ` +
    `${compassLabels.available_time[preferences.available_time]} · ` +
    `${compassLabels.content_type[preferences.content_type]}`;

  const count = recommendations.length;

  const statusNotice = createRecommendationStatus(data, preferences, count);

  compassPreview.replaceChildren(heading, summary, statusNotice);

  // Recommendation Results

  recommendations.forEach((media) => {
    const card = createRecommendationCard(media);

    compassPreview.append(card);
  });

  // Research Disclaimer

  const disclaimer = document.createElement("p");

  disclaimer.textContent =
    "These are preliminary recommendations based on " +
    "technical emotional tags. Relevance scores are " +
    "heuristic and have not been validated through " +
    "independent user research.";

  disclaimer.style.cssText = `
    margin-top: 16px;
    font-size: 12px;
    line-height: 1.6;
    opacity: 0.75;
  `;

  compassPreview.append(disclaimer);

  compassPreview.hidden = false;

  compassPreview.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

// Search Recommendations

compassForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(compassForm);

  const preferences = {
    current_mood: formData.get("current_mood"),
    desired_emotion: formData.get("desired_emotion"),
    available_time: formData.get("available_time"),
    content_type: formData.get("content_type"),
  };

  const validPreferences = Object.entries(preferences).every(
    ([field, value]) => {
      return Object.hasOwn(compassLabels[field], value);
    },
  );

  if (!validPreferences) {
    showCompassMessage("Almost there!", "Please answer all four questions.");

    return;
  }

  compassSubmitButton.disabled = true;

  const originalButtonText = compassSubmitButton.textContent;

  compassSubmitButton.textContent = "SEARCHING...";

  showCompassMessage(
    "Finding your matches ✦",
    "Your Compass is exploring the catalog...",
  );

  try {
    const response = await fetch("/api/compass/recommend", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "same-origin",

      body: JSON.stringify(preferences),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      throw new Error(data?.message || "Unable to generate recommendations.");
    }

    showRecommendations(data, preferences);
  } catch (error) {
    console.error("Compass error:", error);

    showCompassMessage(
      "Something went wrong",
      error.message || "Please try again.",
    );
  } finally {
    compassSubmitButton.disabled = false;
    compassSubmitButton.textContent = originalButtonText;
  }
});
