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
    "180plus": "3 hours or more",
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
  const recommendations = Array.isArray(data.recommendations)
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

  compassPreview.replaceChildren(heading, summary);

  if (recommendations.length === 0) {
    const message = document.createElement("p");

    message.textContent =
      "No exact matches were found. Try another emotion, " +
      "time limit, or content type.";

    compassPreview.append(message);
  } else {
    recommendations.forEach((media) => {
      const card = createRecommendationCard(media);
      compassPreview.append(card);
    });
  }

  if (recommendations.length < 3) {
    const notice = document.createElement("p");

    notice.textContent =
      `Only ${recommendations.length} matching title(s) ` +
      "were found in the current test catalog.";

    notice.style.cssText = `
            margin-top: 16px;
            font-size: 13px;
            opacity: 0.8;
        `;

    compassPreview.append(notice);
  }

  const disclaimer = document.createElement("p");

  disclaimer.textContent =
    "These are preliminary recommendations based on " +
    "test catalog tags, not verified predictions.";

  disclaimer.style.cssText = `
        margin-top: 12px;
        font-size: 12px;
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
