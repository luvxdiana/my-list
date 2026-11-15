// TMDB Library Search
(() => {
  "use strict";
  const supportedCategories = new Set(["movie", "series", "anime"]);
  const section = document.getElementById("tmdb-library");
  const dialog = document.getElementById("entry-dialog");
  const form = document.getElementById("entry-form");
  const input = document.getElementById("tmdb-library-query");
  const button = document.getElementById("tmdb-library-search");
  const results = document.getElementById("tmdb-library-results");
  const message = document.getElementById("tmdb-library-message");
  const title = form.elements.namedItem("title");
  const genreField = document.getElementById("entry-genre-value");
  const description = document.getElementById("entry-description");
  const photoInput = document.getElementById("entry-photo-input");
  const photoPreview = document.getElementById("entry-photo-preview");
  const photoLabel = photoInput.closest(".entry-photo");
  const removePhoto = document.getElementById("remove-photo-btn");
  const isUkrainian = () => window.MyListI18n?.getLanguage?.() !== "en";
  const say = (ua, en) => (isUkrainian() ? ua : en);
  const type = currentCategory === "movie" ? "movie" : "series";
  let version = 0;
  let pending = null;
  let timer = null;

  section.hidden = !supportedCategories.has(currentCategory);
  if (section.hidden) return;

  function setMessage(text) {
    message.textContent = text;
  }
  function stopSearch() {
    version++;
    clearTimeout(timer);
    if (pending) pending.abort();
    pending = null;
    button.disabled = false;
  }
  function clearResults() {
    results.replaceChildren();
  }
  function posterUrl(path, size = "w185") {
    return typeof path === "string" && /^\/[a-zA-Z0-9_.\/-]+$/.test(path)
      ? `https://image.tmdb.org/t/p/${size}${path}`
      : null;
  }
  async function readJson(url, signal) {
    const response = await fetch(url, {
      credentials: "same-origin",
      cache: "no-store",
      signal,
    });
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    if (!response.ok)
      throw new Error(
        data.message || `${response.status} ${response.statusText}`,
      );
    return data;
  }
  function addCard(item) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "tmdb-library-result";
    const poster = posterUrl(item.poster_path);
    if (poster) {
      const img = document.createElement("img");
      img.src = poster;
      img.alt = "";
      img.loading = "lazy";
      card.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "tmdb-empty-image";
      placeholder.textContent = say("Немає постера", "No poster");
      card.appendChild(placeholder);
    }
    const name = document.createElement("span");
    name.className = "tmdb-library-result-name";
    name.textContent = item.title;
    const year = document.createElement("span");
    year.className = "tmdb-library-result-year";
    year.textContent = item.release_year || "—";
    card.append(name, year);
    card.addEventListener("click", () => selectItem(item));
    results.appendChild(card);
  }
  async function search() {
    const q = input.value.trim();
    stopSearch();
    clearResults();
    if (q.length < 2) {
      setMessage(
        say("Введи щонайменше 2 символи.", "Enter at least 2 characters."),
      );
      return;
    }
    const requestVersion = version;
    const controller = new AbortController();
    pending = controller;
    button.disabled = true;
    setMessage(say("Шукаємо в TMDB…", "Searching TMDB…"));
    try {
      const data = await readJson(
        `/api/tmdb/search?type=${type}&q=${encodeURIComponent(q)}`,
        controller.signal,
      );
      if (requestVersion !== version) return;
      const entries = Array.isArray(data.results) ? data.results : [];
      entries
        .filter(
          (item) =>
            Number.isInteger(item.tmdb_id) && typeof item.title === "string",
        )
        .forEach(addCard);
      setMessage(
        entries.length
          ? say(
              "Обери потрібний твір, щоб заповнити форму.",
              "Select a title to fill in the form.",
            )
          : say(
              "Нічого не знайдено. Можна заповнити форму вручну.",
              "No results. You can fill the form manually.",
            ),
      );
    } catch (error) {
      if (requestVersion === version && error.name !== "AbortError")
        setMessage(
          say("Пошук TMDB недоступний: ", "TMDB search unavailable: ") +
            error.message,
        );
    } finally {
      if (requestVersion === version) {
        button.disabled = false;
        pending = null;
      }
    }
  }
  button.addEventListener("click", search);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      search();
    }
  });
  input.addEventListener("input", () => {
    stopSearch();
    clearResults();
    if (input.value.trim().length >= 3) timer = setTimeout(search, 550);
    else setMessage("");
  });
  dialog.addEventListener("close", () => {
    stopSearch();
    input.value = "";
    clearResults();
    setMessage("");
  });

  async function attachPoster(path) {
    const url = posterUrl(path, "w500");
    if (!url) return false;
    try {
      const response = await fetch(url, { mode: "cors", credentials: "omit" });
      if (!response.ok) return false;
      const blob = await response.blob();
      if (!blob.type.startsWith("image/") || blob.size > 5 * 1024 * 1024)
        return false;
      const extension = blob.type === "image/png" ? "png" : "jpg";
      const file = new File([blob], `tmdb-poster.${extension}`, {
        type: blob.type === "image/png" ? "image/png" : "image/jpeg",
      });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      photoInput.files = transfer.files;
      photoInput.dispatchEvent(new Event("change", { bubbles: true }));
      return photoInput.files.length > 0;
    } catch {
      return false;
    }
  }
  async function selectItem(item) {
    stopSearch();
    button.disabled = true;
    setMessage(say("Завантажуємо деталі…", "Loading details…"));
    try {
      const data = await readJson(
        `/api/tmdb/details?type=${type}&id=${encodeURIComponent(item.tmdb_id)}`,
      );
      const media = data.media;
      if (!media || typeof media.title !== "string")
        throw new Error("Invalid TMDB details");
      title.value = media.title;
      description.value = media.description || "";
      description.dispatchEvent(new Event("input", { bubbles: true }));

      // Prefer the site's own genre dictionary instead of inserting incompatible TMDB names.
      const options = [...document.querySelectorAll(".entry-genre-option")];
      const tmdbGenres = Array.isArray(media.genres) ? media.genres : [];
      const normalize = (value) =>
        String(value)
          .toLocaleLowerCase("en")
          .replace(/&/g, "and")
          .replace(/[^a-z0-9]+/g, " ")
          .trim();
      const requested = new Set(tmdbGenres.map((item) => normalize(item.name)));
      const selected = options
        .filter((option) => requested.has(normalize(option.dataset.genre)))
        .slice(0, 5)
        .map((option) => option.dataset.genre);
      if (selected.length) restoreEntryGenres(selected.join(", "));
      else resetGenrePicker();

      const length = form.elements.namedItem("length");
      if (currentCategory === "movie")
        length.value = media.duration_minutes || "";
      // Series/anime library field is total episodes, not runtime per episode.
      // Do not insert duration_minutes there.
      let posterSaved = false;
      if (media.poster_path) {
        posterSaved = await attachPoster(media.poster_path);
        if (!posterSaved && !photoInput.files.length) {
          const preview = posterUrl(media.poster_path, "w500");
          if (preview) {
            photoPreview.src = preview;
            photoPreview.hidden = false;
            photoLabel.classList.add("has-image");
            removePhoto.hidden = false;
          }
        }
      }
      clearResults();
      setMessage(
        posterSaved
          ? say(
              "Дані та обкладинку додано. Перевір форму й натисни «ЗБЕРЕГТИ».",
              "Details and poster added. Review the form and save.",
            )
          : say(
              "Дані заповнено. Якщо обкладинка показана, але не завантажена, додай фото вручну перед збереженням.",
              "Details added. If the poster is preview-only, upload an image manually before saving.",
            ),
      );
    } catch (error) {
      setMessage(
        say("Не вдалося отримати деталі: ", "Could not load details: ") +
          error.message,
      );
    } finally {
      button.disabled = false;
    }
  }
})();
