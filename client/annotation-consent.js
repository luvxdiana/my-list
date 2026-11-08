// Research Elements

const researchInfoPanel = document.getElementById("research-info-panel");

const researchReviewCheckbox = document.getElementById(
  "research-review-checkbox",
);

const researchContinueButton = document.getElementById("research-continue-btn");

const researchAnnotationForm = document.getElementById("annotation-form");

const researchCheckboxGroup = researchReviewCheckbox.closest(".form-group");

// Research Configuration

const PREVIEW_VERSION = "TEST-PREVIEW-v1";

let previewAccessAllowed = false;

// Research Status Message

const researchStatusMessage = document.createElement("div");

researchStatusMessage.className = "preview-notice";

researchStatusMessage.setAttribute("role", "status");
researchStatusMessage.setAttribute("aria-live", "polite");

researchInfoPanel.insertBefore(researchStatusMessage, researchCheckboxGroup);

// Research Document Elements

const researchDocumentPanel = document.createElement("section");

researchDocumentPanel.className = "scale-guide";
researchDocumentPanel.hidden = true;

const researchDocumentHeading = document.createElement("h3");

researchDocumentHeading.textContent = "Research Preview Document";

const researchDocumentVersion = document.createElement("p");

const researchDocumentText = document.createElement("pre");

researchDocumentText.style.whiteSpace = "pre-wrap";
researchDocumentText.style.overflowWrap = "anywhere";
researchDocumentText.style.fontFamily = "inherit";
researchDocumentText.style.fontSize = "inherit";
researchDocumentText.style.lineHeight = "1.7";

const researchDocumentNotice = document.createElement("p");

researchDocumentNotice.textContent =
  "This document is provided for demonstration only. " +
  "Reviewing it does not constitute formal research consent.";

researchDocumentPanel.append(
  researchDocumentHeading,
  researchDocumentVersion,
  researchDocumentText,
  researchDocumentNotice,
);

researchInfoPanel.insertBefore(researchDocumentPanel, researchCheckboxGroup);

// Access Control

function lockResearchPreview(message) {
  previewAccessAllowed = false;

  researchReviewCheckbox.checked = false;
  researchReviewCheckbox.disabled = true;

  researchContinueButton.disabled = true;

  researchAnnotationForm.hidden = true;
  researchDocumentPanel.hidden = true;

  researchStatusMessage.textContent = message;
}

function unlockResearchPreview(message) {
  previewAccessAllowed = true;

  researchReviewCheckbox.checked = false;
  researchReviewCheckbox.disabled = false;

  researchContinueButton.disabled = true;

  researchDocumentPanel.hidden = false;

  researchStatusMessage.textContent = message;
}

// Load Research Document

async function loadResearchDocument() {
  const response = await fetch("/api/research/documents/preview", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new Error("Your session has expired. Please log in again.");
  }

  if (response.status === 403) {
    throw new Error(
      "You do not have permission to view this research document.",
    );
  }

  if (!response.ok) {
    throw new Error("Unable to load the research preview document.");
  }

  const data = await response.json();

  const documentData = data.document;

  // Document Validation

  if (
    data.preview_only !== true ||
    !documentData ||
    documentData.version !== PREVIEW_VERSION ||
    documentData.kind !== "preview" ||
    documentData.status !== "draft" ||
    typeof documentData.title !== "string" ||
    typeof documentData.text !== "string" ||
    !documentData.text.trim()
  ) {
    throw new Error("Unexpected research document response.");
  }

  // Display Document

  researchDocumentHeading.textContent = documentData.title;

  researchDocumentVersion.textContent =
    `Document version: ${documentData.version} | ` +
    `Status: ${documentData.status}`;

  researchDocumentText.textContent = documentData.text;

  return documentData;
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
        "Please log in to My List to access the research form preview.",
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
        "You have not been invited to participate in this research.",
      );

      return;
    }

    // Withdrawn

    if (data.status === "withdrawn") {
      lockResearchPreview(
        "Your research participation has been withdrawn. " +
          "The annotation form is no longer available.",
      );

      return;
    }

    // Preview Eligibility

    const invited = data.status === "invited";

    const activePreview =
      data.status === "active" && data.preview_confirmed === true;

    if (!invited && !activePreview) {
      lockResearchPreview(
        "Research form access is not available " +
          "for your current participation status.",
      );

      return;
    }

    // Load Document

    researchStatusMessage.textContent =
      "Loading the research preview document...";

    await loadResearchDocument();

    // Enable Preview

    if (invited) {
      unlockResearchPreview(
        "You have a research invitation. " +
          "Please review the preview document below before continuing. " +
          "No research consent or answers will be saved.",
      );

      return;
    }

    unlockResearchPreview(
      "Test participation confirmed. " +
        "Please review the preview document below. " +
        "Your answers will not be saved.",
    );
  } catch (error) {
    console.error("Research preview loading error:", error);

    lockResearchPreview(
      error.message ||
        "Unable to prepare the research preview. Please try again.",
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
