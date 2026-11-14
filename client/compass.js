const translateCompass = (key, parameters) =>
  window.MyListI18n?.t(key, parameters) ?? key;
const localizedCompassGenre = (name) => {
  const key = `genre.${name}`;
  const value = translateCompass(key);
  return value === key ? name : value;
};
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
    happy: translateCompass("compass.label.current_mood.happy"),
    sad: translateCompass("compass.label.current_mood.sad"),
    anxious: translateCompass("compass.label.current_mood.anxious"),
    calm: translateCompass("compass.label.current_mood.calm"),
    tired: translateCompass("compass.label.current_mood.tired"),
    excited: translateCompass("compass.label.current_mood.excited"),
  },

  desired_emotion: {
    joy: translateCompass("compass.label.desired_emotion.joy"),
    comfort: translateCompass("compass.label.desired_emotion.comfort"),
    calm: translateCompass("compass.label.desired_emotion.calm"),
    inspiration: translateCompass("compass.label.desired_emotion.inspiration"),
    thrill: translateCompass("compass.label.desired_emotion.thrill"),
    energy: translateCompass("compass.label.desired_emotion.energy"),
  },

  available_time: {
    30: translateCompass("compass.label.available_time.30"),
    60: translateCompass("compass.label.available_time.60"),
    90: translateCompass("compass.label.available_time.90"),
    120: translateCompass("compass.label.available_time.120"),
    "180plus": translateCompass("compass.label.available_time.180plus"),
  },

  content_type: {
    movie: translateCompass("compass.label.content_type.movie"),
    series: translateCompass("compass.label.content_type.series"),
    either: translateCompass("compass.label.content_type.either"),
  },
};

function refreshCompassLabels() {
  Object.entries(compassLabels).forEach(([group, values]) => {
    Object.keys(values).forEach((value) => {
      values[value] = translateCompass(`compass.label.${group}.${value}`);
    });
  });
}

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
  const limitedCoverage = translateCompass("compass.suggest.limited");

  if (
    preferences.content_type !== "either" &&
    preferences.available_time !== "180plus"
  ) {
    return (
      `${limitedCoverage} ` +
      translateCompass("compass.suggest.bothA") +
      translateCompass("compass.suggest.bothB")
    );
  }

  if (preferences.content_type !== "either") {
    return (
      `${limitedCoverage} ` +
      translateCompass("compass.suggest.typeA") +
      translateCompass("compass.suggest.typeB")
    );
  }

  if (preferences.available_time !== "180plus") {
    return (
      `${limitedCoverage} ` +
      translateCompass("compass.suggest.timeA") +
      translateCompass("compass.suggest.timeB")
    );
  }

  return (
    `${limitedCoverage} ` +
    translateCompass("compass.suggest.moreA") +
    translateCompass("compass.suggest.moreB")
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
    title.textContent = translateCompass("compass.status.ready");

    description.textContent =
      translateCompass("compass.status.completeA") +
      translateCompass("compass.status.completeB");
  }

  if (status === "partial") {
    title.textContent =
      count === 1
        ? translateCompass("compass.status.one")
        : translateCompass("compass.status.two");

    description.textContent =
      translateCompass("compass.status.partialA") +
      translateCompass("compass.status.partialB") +
      translateCompass("compass.status.partialC");
  }

  if (status === "empty") {
    title.textContent = translateCompass("compass.status.empty");

    description.textContent =
      translateCompass("compass.status.emptyA") +
      translateCompass("compass.status.emptyB") +
      translateCompass("compass.status.emptyC");
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

  const category =
    media.category === "series"
      ? translateCompass("compass.label.content_type.series")
      : translateCompass("compass.label.content_type.movie");

  const duration =
    media.category === "series"
      ? translateCompass("compass.durationEpisode", {
          minutes: media.duration_minutes,
        })
      : translateCompass("compass.durationMinutes", {
          minutes: media.duration_minutes,
        });

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
    ? translateCompass("compass.genres", {
        genres: media.genres
          .map((name) => localizedCompassGenre(name))
          .join(", "),
      })
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
    ? translateCompass("compass.score", { score: scoreValue.toFixed(2) })
    : translateCompass("compass.scoreUnavailable");

  score.style.cssText = `
    margin: 0;
    font-size: 13px;
    font-weight: 600;
  `;

  card.append(title, details, genres, reasons, score);

  return card;
}

// Show Recommendations
let lastCompassResults = null;

function showRecommendations(data, preferences) {
  lastCompassResults = { data, preferences };
  const recommendations = Array.isArray(data?.recommendations)
    ? data.recommendations
    : [];

  const heading = document.createElement("h3");

  heading.textContent = translateCompass("compass.results.heading");

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

  disclaimer.textContent = translateCompass("compass.researchNote");

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

  // Optional History Saving

  const saveHistory = formData.get("save_history") === "true";

  const validPreferences = Object.entries(preferences).every(
    ([field, value]) => {
      return Object.hasOwn(compassLabels[field], value);
    },
  );

  if (!validPreferences) {
    showCompassMessage(
      translateCompass("compass.validation.title"),
      translateCompass("compass.validation.all"),
    );

    return;
  }

  compassSubmitButton.disabled = true;

  const originalButtonText = compassSubmitButton.textContent;

  compassSubmitButton.textContent = translateCompass("compass.searching");

  showCompassMessage(
    translateCompass("compass.search.waitTitle"),
    translateCompass("compass.search.waitMessage"),
  );

  try {
    const response = await fetch("/api/compass/recommend", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "same-origin",

      body: JSON.stringify({
        ...preferences,
        save_history: saveHistory,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(translateCompass("compass.session.expired"));
      }

      if (response.status === 503 && saveHistory) {
        throw new Error(
          translateCompass("compass.history.unavailableA") +
            translateCompass("compass.history.unavailableB"),
        );
      }

      throw new Error(
        data?.message || translateCompass("compass.recommendations.error"),
      );
    }

    showRecommendations(data, preferences);
  } catch (error) {
    console.error("Compass error:", error);

    showCompassMessage(
      translateCompass("compass.error.title"),
      error.message || translateCompass("compass.error.retry"),
    );
  } finally {
    compassSubmitButton.disabled = false;
    compassSubmitButton.textContent = translateCompass("dashboard.html.search");
  }
});

// Saved Compass History

const compassHistoryHost = document.querySelector(".compass-dialog-scroll");

if (compassHistoryHost) {
  const historySection = document.createElement("section");
  historySection.className = "compass-history-section";
  historySection.style.cssText = `
    margin: 26px 0 8px;
    padding-top: 22px;
    border-top: 1px solid rgba(255, 255, 255, 0.22);
  `;

  const historyButton = document.createElement("button");
  historyButton.type = "button";
  historyButton.textContent = translateCompass("compass.history.view");
  historyButton.setAttribute("aria-controls", "compass-history-results");
  historyButton.setAttribute("aria-expanded", "false");
  historyButton.style.cssText = `
    width: 100%;
    padding: 13px 16px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  `;

  const historyResults = document.createElement("div");
  historyResults.id = "compass-history-results";
  historyResults.setAttribute("aria-live", "polite");
  historyResults.hidden = true;
  historyResults.style.marginTop = "14px";

  historySection.append(historyButton, historyResults);
  compassHistoryHost.append(historySection);

  function historyMessage(message) {
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    paragraph.style.cssText = `
      padding: 12px 14px;
      margin: 0;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      line-height: 1.6;
    `;
    historyResults.replaceChildren(paragraph);
  }

  function historyDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? translateCompass("compass.history.dateError")
      : date.toLocaleString(
          window.MyListI18n?.getLanguage() === "uk" ? "uk-UA" : "en-GB",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          },
        );
  }

  // Feedback Form

  function createFeedbackForm(recommendation, onSaved) {
    const form = document.createElement("form");
    form.className = "compass-feedback-form";
    form.style.cssText = `
      margin: 10px 0 18px;
      padding: 14px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      background: rgba(20, 15, 62, 0.24);
    `;

    const heading = document.createElement("p");
    heading.textContent = recommendation.feedback
      ? translateCompass("compass.feedback.editTitle")
      : translateCompass("compass.feedback.rateTitle");
    heading.style.cssText = `
      margin: 0 0 12px;
      font-size: 13px;
      line-height: 1.5;
      opacity: 0.9;
    `;

    const fields = document.createElement("div");
    fields.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 12px;
    `;

    function makeField(text, element) {
      const label = document.createElement("label");
      label.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 13px;
        line-height: 1.5;
        color: #fff;
      `;

      const caption = document.createElement("span");
      caption.textContent = text;
      label.append(caption, element);
      return label;
    }

    function makeSelect() {
      const select = document.createElement("select");
      select.style.cssText = `
        box-sizing: border-box;
        width: 100%;
        min-height: 39px;
        padding: 8px 10px;
        border: 1px solid rgba(255, 255, 255, 0.42);
        border-radius: 9px;
        background: #353775;
        color: #fff;
        font: inherit;
        font-size: 13px;
        cursor: pointer;
      `;
      return select;
    }

    function addOption(select, value, label) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.append(option);
    }

    const emotionalFit = makeSelect();
    emotionalFit.required = true;
    addOption(
      emotionalFit,
      "",
      translateCompass("compass.feedback.selectRating"),
    );

    for (let value = 1; value <= 5; value += 1) {
      addOption(emotionalFit, String(value), `${value} / 5`);
    }

    emotionalFit.value =
      recommendation.feedback?.emotional_fit_rating == null
        ? ""
        : String(recommendation.feedback.emotional_fit_rating);

    const mediaRating = makeSelect();
    addOption(mediaRating, "", translateCompass("compass.feedback.notRated"));

    for (let halfStars = 1; halfStars <= 10; halfStars += 1) {
      const value = halfStars / 2;
      addOption(mediaRating, String(value), `${value.toFixed(1)} / 5`);
    }

    mediaRating.value =
      recommendation.feedback?.media_rating == null
        ? ""
        : String(Number(recommendation.feedback.media_rating));

    const emotionAchieved = makeSelect();
    addOption(
      emotionAchieved,
      "",
      translateCompass("compass.feedback.noAnswer"),
    );
    addOption(
      emotionAchieved,
      "true",
      translateCompass("compass.feedback.yes"),
    );
    addOption(
      emotionAchieved,
      "false",
      translateCompass("compass.feedback.no"),
    );
    emotionAchieved.value =
      recommendation.feedback?.desired_emotion_achieved == null
        ? ""
        : String(recommendation.feedback.desired_emotion_achieved);

    fields.append(
      makeField(translateCompass("compass.feedback.fit"), emotionalFit),
      makeField(translateCompass("compass.feedback.rating"), mediaRating),
      makeField(translateCompass("compass.feedback.achieved"), emotionAchieved),
    );

    const comment = document.createElement("textarea");
    comment.maxLength = 2000;
    comment.rows = 2;
    comment.placeholder = translateCompass("compass.feedback.note");
    comment.value = recommendation.feedback?.comment || "";
    comment.style.cssText = `
      box-sizing: border-box;
      width: 100%;
      padding: 10px;
      border: 1px solid rgba(255, 255, 255, 0.42);
      border-radius: 9px;
      background: rgba(20, 15, 62, 0.4);
      color: #fff;
      font: inherit;
      font-size: 13px;
      resize: vertical;
    `;

    const commentField = makeField(
      translateCompass("compass.feedback.comment"),
      comment,
    );
    commentField.style.marginTop = "12px";

    const actions = document.createElement("div");
    actions.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
    `;

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = recommendation.feedback
      ? translateCompass("compass.feedback.update")
      : translateCompass("compass.feedback.save");
    submitButton.style.cssText = `
      padding: 10px 14px;
      border: 1px solid rgba(255, 255, 255, 0.45);
      border-radius: 9px;
      background: #ab75cf;
      color: #fff;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    `;

    const status = document.createElement("span");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.style.cssText = "font-size: 13px; line-height: 1.5;";
    actions.append(submitButton, status);

    form.append(heading, fields, commentField, actions);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const recommendationId = recommendation.recommendation_id;

      if (!recommendationId || !emotionalFit.value) {
        status.textContent = translateCompass("compass.feedback.fitRequired");
        return;
      }

      const payload = {
        emotional_fit_rating: Number(emotionalFit.value),
        media_rating: mediaRating.value ? Number(mediaRating.value) : null,
        desired_emotion_achieved:
          emotionAchieved.value === ""
            ? null
            : emotionAchieved.value === "true",
        comment: comment.value.trim() || null,
      };

      submitButton.disabled = true;
      submitButton.textContent = translateCompass("compass.feedback.saving");
      status.textContent = "";

      try {
        const response = await fetch(
          `/api/compass/feedback/${encodeURIComponent(String(recommendationId))}`,
          {
            method: "PUT",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? translateCompass("compass.session.expired")
              : data?.message || translateCompass("compass.feedback.saveError"),
          );
        }

        recommendation.feedback = data?.feedback || payload;
        heading.textContent = translateCompass("compass.feedback.editTitle");
        status.textContent = translateCompass("compass.feedback.saved");
        onSaved(recommendation.feedback);
      } catch (error) {
        status.textContent =
          error.message || translateCompass("compass.feedback.saveError");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = recommendation.feedback
          ? translateCompass("compass.feedback.update")
          : translateCompass("compass.feedback.save");
      }
    });

    return form;
  }

  function createHistoryEntry(entry) {
    const card = document.createElement("article");
    card.style.cssText = `
      margin: 0 0 12px;
      padding: 16px;
      border: 1px solid rgba(255, 255, 255, 0.24);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    `;

    const heading = document.createElement("h4");
    heading.textContent = historyDate(entry.created_at);
    heading.style.cssText = "margin: 0 0 8px; font-size: 16px;";

    const moodLabel =
      compassLabels.current_mood[entry.current_mood] || entry.current_mood;
    const emotionLabel =
      compassLabels.desired_emotion[entry.desired_emotion] ||
      entry.desired_emotion;
    const timeLabel =
      compassLabels.available_time[entry.available_time] ||
      entry.available_time;
    const typeLabel =
      compassLabels.content_type[entry.content_type] || entry.content_type;

    const details = document.createElement("p");
    details.textContent = `${moodLabel} → ${emotionLabel} · ${timeLabel} · ${typeLabel}`;
    details.style.cssText = "margin: 0 0 12px; line-height: 1.6; opacity: 0.9;";

    const list = document.createElement("ol");
    list.style.cssText =
      "margin: 0 0 14px; padding-left: 22px; line-height: 1.8;";

    const recommendations = Array.isArray(entry.recommendations)
      ? entry.recommendations
      : [];

    if (recommendations.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = translateCompass("compass.history.noMatches");
      empty.style.cssText = "margin: 0 0 14px; opacity: 0.85;";
      card.append(heading, details, empty);
    } else {
      for (const recommendation of recommendations) {
        const item = document.createElement("li");
        const score = Number(recommendation.score);
        const scoreLabel = Number.isFinite(score)
          ? translateCompass("compass.history.score", {
              score: score.toFixed(2),
            })
          : "";

        const summary = document.createElement("div");
        summary.style.cssText = "margin: 0 0 8px; font-weight: 600;";

        const title = document.createElement("span");
        title.textContent = `${recommendation.title}${scoreLabel}`;

        const feedbackLabel = document.createElement("span");
        const updateFeedbackLabel = (feedback) => {
          const fit = feedback?.emotional_fit_rating;
          feedbackLabel.textContent =
            fit == null
              ? ""
              : translateCompass("compass.history.emotionalFit", { fit });
        };

        updateFeedbackLabel(recommendation.feedback);
        summary.append(title, feedbackLabel);
        item.append(
          summary,
          createFeedbackForm(recommendation, updateFeedbackLabel),
        );
        list.append(item);
      }
      card.append(heading, details, list);
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = translateCompass("compass.history.delete");
    deleteButton.style.cssText = `
      padding: 9px 12px;
      border: 1px solid rgba(255, 180, 190, 0.75);
      border-radius: 9px;
      background: rgba(150, 40, 60, 0.18);
      color: #fff;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    `;

    deleteButton.addEventListener("click", async () => {
      const confirmed = window.confirm(
        translateCompass("compass.history.deleteConfirm"),
      );
      if (!confirmed) return;

      deleteButton.disabled = true;
      deleteButton.textContent = translateCompass("compass.history.deleting");

      try {
        const response = await fetch(
          `/api/compass/history/${encodeURIComponent(String(entry.id))}`,
          { method: "DELETE", credentials: "same-origin" },
        );
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            data?.message || translateCompass("compass.history.deleteError"),
          );
        }
        await loadCompassHistory();
      } catch (error) {
        historyMessage(
          error.message || translateCompass("compass.history.deleteError"),
        );
      } finally {
        deleteButton.disabled = false;
        deleteButton.textContent = translateCompass("compass.history.delete");
      }
    });

    card.append(deleteButton);
    return card;
  }

  async function loadCompassHistory() {
    historyMessage(translateCompass("compass.history.loading"));

    try {
      const response = await fetch("/api/compass/history", {
        credentials: "same-origin",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? translateCompass("compass.session.expired")
            : data?.message || translateCompass("compass.history.loadError"),
        );
      }

      const entries = Array.isArray(data?.history) ? data.history : [];

      if (historyResults.hidden) return;

      if (entries.length === 0) {
        historyMessage(translateCompass("compass.history.empty"));
        return;
      }

      historyResults.replaceChildren(...entries.map(createHistoryEntry));
    } catch (error) {
      if (!historyResults.hidden) {
        historyMessage(
          error.message || translateCompass("compass.history.loadError"),
        );
      }
    }
  }

  document.addEventListener("mylist:languagechange", () => {
    if (!historyResults.hidden) loadCompassHistory();
  });

  historyButton.addEventListener("click", async () => {
    const willOpen = historyResults.hidden;
    historyResults.hidden = !willOpen;
    historyButton.setAttribute("aria-expanded", String(willOpen));
    historyButton.textContent = willOpen
      ? translateCompass("compass.history.hide")
      : translateCompass("compass.history.view");

    if (willOpen) await loadCompassHistory();
  });
}

// Language changes
document.addEventListener("mylist:languagechange", () => {
  refreshCompassLabels();
  if (lastCompassResults && !compassPreview.hidden) {
    showRecommendations(
      lastCompassResults.data,
      lastCompassResults.preferences,
    );
  }
  const historyButton = document.querySelector(
    ".compass-history-section button",
  );
  const historyResults = document.getElementById("compass-history-results");
  if (historyButton)
    historyButton.textContent =
      historyResults && !historyResults.hidden
        ? translateCompass("compass.history.hide")
        : translateCompass("compass.history.view");
});
