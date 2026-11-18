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

// Reminder Localization

const norwegianReminderTranslations = {
  "compass.reminder.question": "Har du sett «{title}»?",
  "compass.reminder.watched": "Sett",
  "compass.reminder.description":
    "Du åpnet visningsalternativene. Hvis du har sett filmen eller serien, kan du vurdere hvor godt Compass traff ønsket følelse.",
  "compass.reminder.yes": "Ja, vurder",
  "compass.reminder.later": "Ikke sett ennå",
  "compass.reminder.dismiss": "Ikke minn meg på det",
  "compass.reminder.fit": "Hvor godt traff Compass med anbefalingen? ",
  "compass.reminder.achieved": "Fikk du følelsen du ønsket? ",
  "compass.reminder.unspecified": "Ikke oppgitt",
  "compass.reminder.answerYes": "Ja",
  "compass.reminder.answerNo": "Nei",
  "compass.reminder.confirm": "Bekreft at du har sett den",
  "compass.reminder.saving": "Lagrer…",
  "compass.reminder.saved":
    "Lagt til i My List (Completed). Du kan legge til egen vurdering, omtale og forsidebilde i biblioteket.",
  "compass.reminder.saveError": "Kunne ikke lagre visningen.",
  "compass.reminder.genreLabel": "Sjangre: {genres}",
  "compass.watch.button": "Hvor kan jeg se den?",
  "compass.watch.region": "Land: ",
  "compass.watch.norway": "Norge",
  "compass.watch.ukraine": "Ukraina",
  "compass.watch.loading": "Laster tilgjengelige strømmetjenester…",
  "compass.watch.loadError": "Kunne ikke laste strømmetjenester.",
  "compass.watch.subscription": "Abonnement",
  "compass.watch.free": "Gratis",
  "compass.watch.ads": "Med reklame",
  "compass.watch.rent": "Leie",
  "compass.watch.buy": "Kjøp",
  "compass.watch.none":
    "TMDB har ingen bekreftede visningsalternativer for dette landet.",
  "compass.watch.open": "Åpne visningsalternativer på TMDB ↗",
  "compass.watch.attribution":
    "Tilgjengelighetsdata: JustWatch via TMDB. Utvalget kan endres. Lenken går til TMDB, ikke direkte til videoen.",
  "compass.watch.genericError": "Kunne ikke laste data.",
};

function reminderText(key, parameters = {}) {
  const language = window.MyListI18n?.getLanguage?.() || "uk";
  if (language === "no" || language === "nb" || language === "nn") {
    const template = norwegianReminderTranslations[key];
    if (template) {
      return template.replace(/\{(\w+)\}/g, (_, name) =>
        String(parameters[name] ?? ""),
      );
    }
  }
  return translateCompass(key, parameters);
}

// Watch Reminder

const COMPASS_WATCH_INTENTS_KEY = "mylist-compass-watch-intents-v1";
let compassReminderLoadId = 0;

function getWatchIntents() {
  try {
    const saved = JSON.parse(localStorage.getItem(COMPASS_WATCH_INTENTS_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveWatchIntents(items) {
  try {
    localStorage.setItem(
      COMPASS_WATCH_INTENTS_KEY,
      JSON.stringify(items.slice(-40)),
    );
  } catch {
    // Browser storage might be disabled.
  }
}

function rememberWatchInterest(media) {
  if (!media.recommendation_id || !media.tmdb_id) return;
  const items = getWatchIntents();
  const id = String(media.recommendation_id);
  const existing = items.filter(
    (item) => String(item.recommendation_id) !== id,
  );
  existing.push({
    recommendation_id: id,
    tmdb_id: media.tmdb_id,
    category: media.category,
    title: media.title,
    // Preserve the displayed metadata: the history endpoint omits genres.
    genres: Array.isArray(media.genres) ? media.genres : [],
    reasons: Array.isArray(media.reasons) ? media.reasons : [],
    score: media.score ?? null,
    position: media.position ?? null,
    duration_minutes: media.duration_minutes ?? null,
    release_year: media.release_year ?? null,
    added_at: Date.now(),
  });
  saveWatchIntents(existing);
}

function clearWatchInterest(media) {
  const items = getWatchIntents().filter(
    (item) =>
      !(
        item.category === media.category &&
        String(item.tmdb_id) === String(media.tmdb_id)
      ),
  );
  saveWatchIntents(items);
}

async function showPendingWatchReminder(opening) {
  const pending = getWatchIntents();
  if (!pending.length) return;

  try {
    const response = await fetch("/api/compass/history", {
      credentials: "same-origin",
    });
    if (!response.ok) return;
    const result = await response.json();
    if (!Array.isArray(result.history)) return;

    // Only display recommendations found in the currently authenticated user's history.
    const owned = new Map();
    for (const request of result.history) {
      for (const item of request.recommendations || []) {
        owned.set(String(item.recommendation_id), item);
      }
    }

    const match = [...pending].reverse().find((intent) => {
      const item = owned.get(String(intent.recommendation_id));
      return (
        item &&
        item.category === intent.category &&
        item.title === intent.title &&
        !item.feedback
      );
    });

    if (
      !match ||
      opening !== compassReminderLoadId ||
      !compassDialog.open ||
      !compassPreview.hidden
    )
      return;

    const media = owned.get(String(match.recommendation_id));
    const title = document.createElement("h3");
    title.textContent = reminderText("compass.reminder.question", {
      title: match.title,
    });
    const description = document.createElement("p");
    description.textContent = reminderText("compass.reminder.description");

    const actions = document.createElement("div");
    actions.style.cssText =
      "display: flex; flex-wrap: wrap; gap: 10px; margin: 14px 0;";
    function action(label) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.style.cssText =
        "padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,.5); background: #353775; color: #fff; font: inherit; cursor: pointer;";
      return button;
    }
    const yes = action(reminderText("compass.reminder.yes"));
    const later = action(reminderText("compass.reminder.later"));
    const dismiss = action(reminderText("compass.reminder.dismiss"));
    actions.append(yes, later, dismiss);
    compassPreview.replaceChildren(title, description, actions);
    compassPreview.hidden = false;

    yes.addEventListener("click", () => {
      const reminderMedia = {
        ...media,
        tmdb_id: match.tmdb_id,
        genres:
          Array.isArray(match.genres) && match.genres.length
            ? match.genres
            : Array.isArray(media.genres)
              ? media.genres
              : [],
        reasons:
          Array.isArray(match.reasons) && match.reasons.length
            ? match.reasons
            : Array.isArray(media.reasons)
              ? media.reasons
              : [],
        score: match.score ?? media.score,
        position: match.position ?? media.position ?? 1,
        duration_minutes: match.duration_minutes ?? media.duration_minutes,
        release_year: match.release_year ?? media.release_year,
      };
      const card = createRecommendationCard(reminderMedia);
      compassPreview.replaceChildren(title, card);
      const toggle = card.querySelector(".compass-watched-toggle");
      if (toggle) toggle.click();
    });
    later.addEventListener("click", () => {
      compassPreview.hidden = true;
    });
    dismiss.addEventListener("click", () => {
      clearWatchInterest(match);
      compassPreview.hidden = true;
    });
  } catch (error) {
    console.warn("Compass reminder unavailable:", error);
  }
}

// Dialog

compassOpenButton.addEventListener("click", () => {
  compassPreview.hidden = true;

  if (!compassDialog.open) {
    compassDialog.showModal();
  }

  const opening = ++compassReminderLoadId;
  showPendingWatchReminder(opening);
});

compassCloseButton.addEventListener("click", () => {
  compassReminderLoadId += 1;
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

compassForm.addEventListener("change", (event) => {
  const preferenceFields = new Set([
    "current_mood",
    "desired_emotion",
    "available_time",
    "content_type",
  ]);

  if (preferenceFields.has(event.target?.name)) {
    compassPreview.hidden = true;
  }
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

  genres.textContent =
    Array.isArray(media.genres) && media.genres.length
      ? reminderText("compass.reminder.genreLabel", {
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
    ? media.reasons
        .map((reason) => {
          const key = `compass.reason.${reason}`;
          const translation = translateCompass(key);
          return translation === key ? reason : translation;
        })
        .join(" · ")
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

  // Watch Providers
  if (Number.isInteger(Number(media.tmdb_id)) && Number(media.tmdb_id) > 0) {
    const platformsButton = document.createElement("button");
    platformsButton.type = "button";
    platformsButton.textContent = reminderText("compass.watch.button");
    platformsButton.style.cssText = `
      margin-top: 14px; margin-right: 10px; padding: 10px 14px;
      border: 1px solid rgba(255,255,255,0.55); border-radius: 10px;
      background: transparent; color: #fff; font: inherit; cursor: pointer;
    `;

    const platformsPanel = document.createElement("div");
    platformsPanel.hidden = true;
    platformsPanel.style.cssText = `
      margin-top: 12px; padding: 14px; border: 1px solid rgba(255,255,255,0.3);
      border-radius: 10px; color: #fff; font-size: 14px; line-height: 1.6;
    `;

    const regionLabel = document.createElement("label");
    regionLabel.textContent = reminderText("compass.watch.region");
    const regionSelect = document.createElement("select");
    regionSelect.style.cssText = `
      margin-left: 8px; padding: 7px; border-radius: 7px;
      color: #fff; background: #353775; font: inherit;
    `;
    for (const [value, name] of [
      ["NO", reminderText("compass.watch.norway")],
      ["UA", reminderText("compass.watch.ukraine")],
    ]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = name;
      regionSelect.append(option);
    }
    regionLabel.append(regionSelect);

    const platformsResult = document.createElement("div");
    platformsResult.setAttribute("role", "status");
    platformsResult.setAttribute("aria-live", "polite");
    platformsResult.style.marginTop = "12px";
    platformsPanel.append(regionLabel, platformsResult);

    async function loadWatchProviders() {
      platformsResult.textContent = reminderText("compass.watch.loading");
      regionSelect.disabled = true;
      try {
        const params = new URLSearchParams({
          type: media.category,
          id: String(media.tmdb_id),
          region: regionSelect.value,
        });
        const response = await fetch(`/api/tmdb/watch-providers?${params}`, {
          credentials: "same-origin",
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            data?.message || reminderText("compass.watch.loadError"),
          );
        }

        const content = document.createElement("div");
        const labels = {
          flatrate: reminderText("compass.watch.subscription"),
          free: reminderText("compass.watch.free"),
          ads: reminderText("compass.watch.ads"),
          rent: reminderText("compass.watch.rent"),
          buy: reminderText("compass.watch.buy"),
        };
        let found = false;
        for (const [key, label] of Object.entries(labels)) {
          const providers = Array.isArray(data.providers?.[key])
            ? data.providers[key]
            : [];
          if (!providers.length) continue;
          found = true;
          const line = document.createElement("p");
          line.style.margin = "6px 0";
          line.textContent = `${label}: ${[...new Set(providers.map((p) => p.name))].join(", ")}`;
          content.append(line);
        }
        if (!found) {
          const empty = document.createElement("p");
          empty.textContent = reminderText("compass.watch.none");
          content.append(empty);
        }

        if (data.watch_url) {
          const link = document.createElement("a");
          link.href = data.watch_url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = reminderText("compass.watch.open");
          link.style.cssText =
            "display: inline-block; margin-top: 8px; color: #f2c5ff;";
          link.addEventListener("click", () => rememberWatchInterest(media));
          content.append(link);
        }
        const attribution = document.createElement("p");
        attribution.textContent = reminderText("compass.watch.attribution");
        attribution.style.cssText =
          "margin: 12px 0 0; font-size: 12px; opacity: 0.8;";
        content.append(attribution);
        platformsResult.replaceChildren(content);
      } catch (error) {
        platformsResult.textContent =
          error.message || reminderText("compass.watch.genericError");
      } finally {
        regionSelect.disabled = false;
      }
    }

    platformsButton.addEventListener("click", () => {
      platformsPanel.hidden = !platformsPanel.hidden;
      if (!platformsPanel.hidden && !platformsResult.hasChildNodes()) {
        loadWatchProviders();
      }
    });
    regionSelect.addEventListener("change", loadWatchProviders);
    card.append(platformsButton, platformsPanel);
  }

  if (media.recommendation_id) {
    const watchedButton = document.createElement("button");
    watchedButton.type = "button";
    watchedButton.className = "compass-watched-toggle";
    watchedButton.textContent = reminderText("compass.reminder.watched");
    watchedButton.style.cssText = `
      margin-top: 14px; padding: 10px 14px; border: 1px solid #c080dd;
      border-radius: 10px; background: #ab75cf; color: #fff;
      font: inherit; cursor: pointer;
    `;

    const watchedPanel = document.createElement("div");
    watchedPanel.hidden = true;
    watchedPanel.style.cssText = "margin-top: 12px; color: #fff;";

    const fitLabel = document.createElement("label");
    fitLabel.textContent = reminderText("compass.reminder.fit");
    const fitSelect = document.createElement("select");
    fitSelect.required = true;
    fitSelect.style.cssText =
      "padding: 8px; margin: 8px; color: #fff; background: #353775;";
    for (let i = 1; i <= 5; i += 1) {
      const option = document.createElement("option");
      option.value = String(i);
      option.textContent = `${i} / 5`;
      fitSelect.append(option);
    }
    fitLabel.append(fitSelect);

    const achievedLabel = document.createElement("label");
    achievedLabel.textContent = reminderText("compass.reminder.achieved");
    const achieved = document.createElement("select");
    achieved.style.cssText =
      "padding: 8px; margin: 8px; color: #fff; background: #353775;";
    for (const [value, label] of [
      ["", reminderText("compass.reminder.unspecified")],
      ["true", reminderText("compass.reminder.answerYes")],
      ["false", reminderText("compass.reminder.answerNo")],
    ]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      achieved.append(option);
    }
    achievedLabel.append(achieved);

    const submit = document.createElement("button");
    submit.type = "button";
    submit.textContent = reminderText("compass.reminder.confirm");
    submit.style.cssText =
      "padding: 11px 18px; border: 1px solid #c889eb; border-radius: 10px; background: #ab75cf; color: #fff; font: inherit; font-weight: 600; cursor: pointer;";
    const message = document.createElement("p");
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    message.style.cssText = "font-size: 13px; margin-top: 8px;";

    watchedPanel.append(
      fitLabel,
      document.createElement("br"),
      achievedLabel,
      document.createElement("br"),
      submit,
      message,
    );
    watchedButton.addEventListener("click", () => {
      watchedPanel.hidden = !watchedPanel.hidden;
    });

    submit.addEventListener("click", async () => {
      submit.disabled = true;
      message.textContent = reminderText("compass.reminder.saving");
      try {
        const response = await fetch(
          `/api/compass/watched/${encodeURIComponent(String(media.recommendation_id))}`,
          {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              emotional_fit_rating: Number(fitSelect.value),
              desired_emotion_achieved:
                achieved.value === "" ? null : achieved.value === "true",
            }),
          },
        );
        const result = await response.json().catch(() => null);
        if (!response.ok)
          throw new Error(
            result?.message || reminderText("compass.reminder.saveError"),
          );
        message.textContent = reminderText("compass.reminder.saved");
        watchedButton.disabled = true;
        submit.hidden = true;
        clearWatchInterest(media);
      } catch (error) {
        message.textContent = error.message;
      } finally {
        submit.disabled = false;
      }
    });

    card.append(watchedButton, watchedPanel);
  }

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

// Persistent Recommendation IDs

const historyChoice = document.querySelector(".compass-save-history");
if (historyChoice) historyChoice.style.display = "none";

const compassPrivacyNote = compassForm.querySelector(".compass-privacy-note");
if (compassPrivacyNote) compassPrivacyNote.style.display = "none";

// Search Recommendations

compassForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  compassReminderLoadId += 1;

  const formData = new FormData(compassForm);

  const preferences = {
    current_mood: formData.get("current_mood"),
    desired_emotion: formData.get("desired_emotion"),
    available_time: formData.get("available_time"),
    content_type: formData.get("content_type"),
  };

  // Optional History Saving

  const saveHistory = true;

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

// Language changes
document.addEventListener("mylist:languagechange", () => {
  refreshCompassLabels();
  if (lastCompassResults && !compassPreview.hidden) {
    showRecommendations(
      lastCompassResults.data,
      lastCompassResults.preferences,
    );
  }
});
