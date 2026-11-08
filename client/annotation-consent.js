// Research Information

const researchInfoPanel = document.getElementById("research-info-panel");

const researchReviewCheckbox = document.getElementById(
  "research-review-checkbox",
);

const researchContinueButton = document.getElementById("research-continue-btn");

const researchAnnotationForm = document.getElementById("annotation-form");

// Review

researchReviewCheckbox.addEventListener("change", () => {
  researchContinueButton.disabled = !researchReviewCheckbox.checked;
});

// Continue to Preview

researchContinueButton.addEventListener("click", () => {
  if (!researchReviewCheckbox.checked) {
    return;
  }

  researchInfoPanel.hidden = true;
  researchAnnotationForm.hidden = false;

  researchAnnotationForm.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});
