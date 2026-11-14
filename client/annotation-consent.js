// Localized interface text
const consentPageText = (value) => {
  const key = window.MyListPageTextKeys?.[String(value)];
  return key ? window.MyListI18n.t(key) : value;
};

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
let loadedPreviewDocument = null;
let acknowledgementInProgress = false;

// Research Status

const researchStatusMessage = document.createElement("div");

researchStatusMessage.className = "preview-notice";
researchStatusMessage.setAttribute("role", "status");
researchStatusMessage.setAttribute("aria-live", "polite");

researchInfoPanel.insertBefore(researchStatusMessage, researchCheckboxGroup);

// Research Document

const researchDocumentPanel = document.createElement("section");

researchDocumentPanel.className = "scale-guide";
researchDocumentPanel.hidden = true;

const researchDocumentHeading = document.createElement("h3");

researchDocumentHeading.textContent = consentPageText(
  "Research Preview Document",
);

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

// Form Notice

const researchFormNotice = document.createElement("div");

researchFormNotice.className = "preview-notice";
researchFormNotice.setAttribute("role", "status");

researchAnnotationForm.insertBefore(
  researchFormNotice,
  researchAnnotationForm.firstChild,
);

// Access Control

function lockResearchPreview(message) {
  previewAccessAllowed = false;
  loadedPreviewDocument = null;

  researchReviewCheckbox.checked = false;
  researchReviewCheckbox.disabled = true;

  researchContinueButton.disabled = true;
  researchContinueButton.textContent = consentPageText(
    "CONTINUE TO FORM PREVIEW →",
  );

  researchAnnotationForm.hidden = true;
  researchDocumentPanel.hidden = true;

  researchStatusMessage.textContent = message;
}

function unlockResearchPreview(message) {
  previewAccessAllowed = true;

  researchReviewCheckbox.checked = false;
  researchReviewCheckbox.disabled = false;

  researchContinueButton.disabled = true;
  researchContinueButton.textContent = consentPageText(
    "CONTINUE TO FORM PREVIEW →",
  );

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
    throw new Error(
      consentPageText("Your session has expired. Please log in again."),
    );
  }

  if (response.status === 403) {
    throw new Error(
      consentPageText(
        "You do not have permission to view this research document.",
      ),
    );
  }

  if (!response.ok) {
    throw new Error(
      consentPageText("Unable to load the research preview document."),
    );
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
    !documentData.text.trim() ||
    typeof documentData.hash !== "string" ||
    !/^[a-f0-9]{64}$/.test(documentData.hash)
  ) {
    throw new Error(consentPageText("Unexpected research document response."));
  }

  // Display Document

  researchDocumentHeading.textContent = documentData.title;

  researchDocumentVersion.textContent =
    `Document version: ${documentData.version} | ` +
    `Status: ${documentData.status}`;

  researchDocumentText.textContent = documentData.text;

  loadedPreviewDocument = {
    version: documentData.version,
    hash: documentData.hash,
  };
}

// Load Research Status

async function loadResearchStatus() {
  lockResearchPreview(
    consentPageText("Checking your research participation status..."),
  );

  try {
    const response = await fetch("/api/research/status", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.status === 401) {
      lockResearchPreview(
        consentPageText(
          "Please log in to My List to access the research form preview.",
        ),
      );

      return;
    }

    if (!response.ok) {
      throw new Error(
        consentPageText("Unable to verify research participation."),
      );
    }

    const data = await response.json();

    // Not Invited

    if (data.status === "not_invited") {
      lockResearchPreview(
        consentPageText(
          "You have not been invited to participate in this research.",
        ),
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

    researchStatusMessage.textContent = consentPageText(
      "Loading the research preview document...",
    );

    await loadResearchDocument();

    // Enable Preview

    if (invited) {
      unlockResearchPreview(
        "You have a research invitation. " +
          "Please review the preview document before continuing. " +
          "This is not formal research consent.",
      );

      return;
    }

    unlockResearchPreview(
      "Test participation confirmed. " +
        "Please review the preview document before continuing. " +
        "This is not formal research consent.",
    );
  } catch (error) {
    console.error("Research preview loading error:", error);

    lockResearchPreview(
      error.message ||
        consentPageText("Unable to prepare the research preview."),
    );
  }
}

// Acknowledgement

async function recordPreviewAcknowledgement() {
  if (!loadedPreviewDocument) {
    throw new Error(
      consentPageText("Research preview document has not been loaded."),
    );
  }

  const response = await fetch("/api/research/documents/preview-acknowledge", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      version: loadedPreviewDocument.version,
      document_hash: loadedPreviewDocument.hash,
    }),
  });

  const data = await response.json().catch(() => ({}));

  // Request Errors

  if (!response.ok) {
    const error = new Error(
      data.message ||
        consentPageText("Unable to record preview acknowledgement."),
    );

    error.status = response.status;

    throw error;
  }

  // Response Validation

  const newlyRecorded =
    response.status === 201 &&
    data.saved === true &&
    data.already_recorded === false;

  const previouslyRecorded =
    response.status === 200 &&
    data.saved === false &&
    data.already_recorded === true;

  if (
    data.preview_only !== true ||
    data.document_version !== PREVIEW_VERSION ||
    (!newlyRecorded && !previouslyRecorded)
  ) {
    throw new Error(
      consentPageText("Unexpected preview acknowledgement response."),
    );
  }

  return {
    newlyRecorded,
    previouslyRecorded,
  };
}

// Checkbox

researchReviewCheckbox.addEventListener("change", () => {
  researchContinueButton.disabled =
    !previewAccessAllowed ||
    !researchReviewCheckbox.checked ||
    acknowledgementInProgress;
});

// Continue to Preview

researchContinueButton.addEventListener("click", async () => {
  if (
    !previewAccessAllowed ||
    !researchReviewCheckbox.checked ||
    !loadedPreviewDocument ||
    acknowledgementInProgress
  ) {
    return;
  }

  acknowledgementInProgress = true;

  researchReviewCheckbox.disabled = true;
  researchContinueButton.disabled = true;

  researchContinueButton.textContent = consentPageText(
    "RECORDING PREVIEW ACKNOWLEDGEMENT...",
  );

  researchStatusMessage.textContent = consentPageText(
    "Recording your test acknowledgement...",
  );

  try {
    // Server Acknowledgement

    const result = await recordPreviewAcknowledgement();

    // Form Message

    if (result.newlyRecorded) {
      researchFormNotice.textContent =
        "Your test acknowledgement has been recorded. " +
        "This is not formal research consent. " +
        "Your annotation answers will not be saved.";
    } else {
      researchFormNotice.textContent =
        "Your test acknowledgement was already recorded. " +
        "No duplicate event was created. " +
        "Your annotation answers will not be saved.";
    }

    // Open Form

    researchInfoPanel.hidden = true;
    researchAnnotationForm.hidden = false;

    researchAnnotationForm.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } catch (error) {
    console.error("Research acknowledgement error:", error);

    // Access Or Document Errors

    if (error.status === 401 || error.status === 403 || error.status === 409) {
      lockResearchPreview(error.message + " Please refresh the page.");

      return;
    }

    // Retry Allowed

    researchStatusMessage.textContent =
      error.message ||
      consentPageText("Unable to record acknowledgement. Please try again.");
  } finally {
    acknowledgementInProgress = false;

    if (previewAccessAllowed) {
      researchReviewCheckbox.disabled = false;

      researchContinueButton.disabled = !researchReviewCheckbox.checked;

      researchContinueButton.textContent = consentPageText(
        "CONTINUE TO FORM PREVIEW →",
      );
    }
  }
});

// Initialization

loadResearchStatus();
