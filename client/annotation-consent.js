// Research Elements

const researchInfoPanel = document.getElementById("research-info-panel");

const researchReviewCheckbox = document.getElementById(
  "research-review-checkbox",
);

const researchContinueButton = document.getElementById("research-continue-btn");

const researchAnnotationForm = document.getElementById("annotation-form");

// Research Status

let previewAccessAllowed = false;

const researchStatusMessage = document.createElement("div");

researchStatusMessage.className = "preview-notice";

researchStatusMessage.setAttribute("role", "status");
researchStatusMessage.setAttribute("aria-live", "polite");

researchInfoPanel.insertBefore(
  researchStatusMessage,
  researchReviewCheckbox.closest(".form-group"),
);

// Access Control

function lockResearchPreview(message) {
  previewAccessAllowed = false;

  researchReviewCheckbox.checked = false;
  researchReviewCheckbox.disabled = true;

  researchContinueButton.disabled = true;

  researchAnnotationForm.hidden = true;

  researchStatusMessage.textContent = message;
}

function unlockResearchPreview(message) {
  previewAccessAllowed = true;

  researchReviewCheckbox.checked = false;
  researchReviewCheckbox.disabled = false;

  researchContinueButton.disabled = true;

  researchStatusMessage.textContent = message;
}

// Load Research Status

async function loadResearchStatus() {
  lockResearchPreview("Checking your research participation status...");

  try {
    const response = await fetch("/api/research/status", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.status === 401) {
      lockResearchPreview(
        "Please log in to My List to access " + "the research form preview.",
      );

      return;
    }

    if (!response.ok) {
      throw new Error("Unable to verify research participation.");
    }

    const data = await response.json();

    // Not Invited

    if (data.status === "not_invited") {
      lockResearchPreview(
        "You have not been invited to " + "participate in this research.",
      );

      return;
    }

    // Invited

    if (data.status === "invited") {
      unlockResearchPreview(
        "You have a research invitation. " +
          "You may explore this demonstration form. " +
          "No research consent or answers will be saved.",
      );

      return;
    }

    // Active Preview

    if (data.status === "active" && data.preview_confirmed === true) {
      unlockResearchPreview(
        "Test participation confirmed. " +
          "You can continue to the form preview. " +
          "Your answers will not be saved.",
      );

      return;
    }

    // Withdrawn

    if (data.status === "withdrawn") {
      lockResearchPreview(
        "Your research participation has been " +
          "withdrawn. The annotation form " +
          "is no longer available.",
      );

      return;
    }

    // Other Status

    lockResearchPreview(
      "Research form access is not available " +
        "for your current participation status.",
    );
  } catch (error) {
    console.error("Research status error:", error);

    lockResearchPreview(
      "Unable to check your research status. " +
        "Please refresh the page and try again.",
    );
  }
}

// Checkbox

researchReviewCheckbox.addEventListener("change", () => {
  researchContinueButton.disabled =
    !previewAccessAllowed || !researchReviewCheckbox.checked;
});

// Continue to Preview

researchContinueButton.addEventListener("click", () => {
  if (!previewAccessAllowed || !researchReviewCheckbox.checked) {
    return;
  }

  researchInfoPanel.hidden = true;
  researchAnnotationForm.hidden = false;

  researchAnnotationForm.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

// Initialization

loadResearchStatus();
