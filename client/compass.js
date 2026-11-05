// Elements

const compassOpenButton = document.getElementById("open-compass-btn");
const compassCloseButton = document.getElementById("close-compass-btn");

const compassDialog = document.getElementById("compass-dialog");
const compassForm = document.getElementById("compass-form");

const compassPreview = document.getElementById("compass-preview");
const compassPreviewText = document.getElementById("compass-preview-text");

const compassMascot = document.querySelector(".compass-mascot");
const compassFallback = document.querySelector(".compass-icon-fallback");

// Mascot

function showCompassFallback() {
  compassMascot.hidden = true;
  compassFallback.hidden = false;
}

compassMascot.addEventListener("error", showCompassFallback);

if (compassMascot.complete && compassMascot.naturalWidth === 0) {
  showCompassFallback();
}

// Labels

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

// Open

compassOpenButton.addEventListener("click", () => {
  compassPreview.hidden = true;

  if (!compassDialog.open) {
    compassDialog.showModal();
  }
});

// Close

compassCloseButton.addEventListener("click", () => {
  compassDialog.close();
});

// Backdrop

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

// Reset Preview

compassForm.addEventListener("change", () => {
  compassPreview.hidden = true;
});

// Search

compassForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(compassForm);

  const currentMood = formData.get("current_mood");
  const desiredEmotion = formData.get("desired_emotion");
  const availableTime = formData.get("available_time");
  const contentType = formData.get("content_type");

  if (
    !compassLabels.current_mood[currentMood] ||
    !compassLabels.desired_emotion[desiredEmotion] ||
    !compassLabels.available_time[availableTime] ||
    !compassLabels.content_type[contentType]
  ) {
    return;
  }

  const moodText = compassLabels.current_mood[currentMood];
  const emotionText = compassLabels.desired_emotion[desiredEmotion];
  const timeText = compassLabels.available_time[availableTime];
  const contentText = compassLabels.content_type[contentType];

  compassPreviewText.textContent =
    `Current mood: ${moodText}. ` +
    `Desired emotion: ${emotionText}. ` +
    `Available time: ${timeText}. ` +
    `Content: ${contentText}.`;

  compassPreview.hidden = false;

  compassPreview.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
});
