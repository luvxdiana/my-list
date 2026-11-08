// Research Routes

const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const {
  validateResearchAnnotation,
} = require("../services/validateResearchAnnotation");

const router = express.Router();

const PREVIEW_VERSION = "TEST-PREVIEW-v1";

// Research Status

router.get("/status", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
            SELECT
                status,
                consent_version,
                consented_at,
                withdrawn_at
            FROM public.research_annotators
            WHERE user_id = $1
            LIMIT 1
            `,
      [req.userId],
    );

    const participant = result.rows[0] || null;

    const isPreview = Boolean(
      participant && participant.consent_version === PREVIEW_VERSION,
    );

    const consentRecorded = Boolean(participant?.consented_at && !isPreview);

    const previewConfirmed = Boolean(participant?.consented_at && isPreview);

    const canAnnotate = Boolean(
      participant &&
      participant.status === "active" &&
      consentRecorded &&
      !participant.withdrawn_at,
    );

    res.set("Cache-Control", "no-store");

    return res.json({
      status: participant?.status || "not_invited",
      consent_recorded: consentRecorded,
      preview_confirmed: previewConfirmed,
      can_annotate: canAnnotate,
    });
  } catch (error) {
    console.error("Research status error:", error);

    return res.status(500).json({
      message: "Unable to check research status.",
    });
  }
});

// Preview Confirmation

router.post("/preview-consent", requireAuth, async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  if (req.body?.acknowledged !== true) {
    return res.status(400).json({
      message: "Explicit confirmation is required.",
    });
  }

  try {
    const result = await pool.query(
      `
                UPDATE public.research_annotators
                SET
                    status = 'active',
                    consent_version = $2,
                    consented_at = NOW()
                WHERE user_id = $1
                  AND annotator_code = 'TEST001'
                  AND status = 'invited'
                  AND consented_at IS NULL
                  AND withdrawn_at IS NULL
                RETURNING
                    status,
                    consent_version,
                    consented_at
                `,
      [req.userId, PREVIEW_VERSION],
    );

    if (result.rowCount === 0) {
      return res.status(409).json({
        message: "No eligible test invitation found.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.json({
      message: "Test confirmation recorded.",
      status: result.rows[0].status,
      preview_only: true,
      consent_version: PREVIEW_VERSION,
      can_annotate: false,
    });
  } catch (error) {
    console.error("Research preview confirmation error:", error);

    return res.status(500).json({
      message: "Unable to record confirmation.",
    });
  }
});

// Preview Withdrawal

router.post("/preview-withdraw", requireAuth, async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  try {
    const result = await pool.query(
      `
                UPDATE public.research_annotators
                SET
                    status = 'withdrawn',
                    withdrawn_at = NOW()
                WHERE user_id = $1
                  AND annotator_code = 'TEST001'
                  AND status = 'active'
                  AND consent_version = $2
                  AND consented_at IS NOT NULL
                  AND withdrawn_at IS NULL
                RETURNING
                    status,
                    withdrawn_at
                `,
      [req.userId, PREVIEW_VERSION],
    );

    if (result.rowCount === 0) {
      return res.status(409).json({
        message: "No active test participation found.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.json({
      message: "Test participation withdrawn.",
      status: result.rows[0].status,
      withdrawn_at: result.rows[0].withdrawn_at,
      preview_only: true,
      can_annotate: false,
    });
  } catch (error) {
    console.error("Research withdrawal error:", error);

    return res.status(500).json({
      message: "Unable to withdraw participation.",
    });
  }
});

// Annotation Preview Validation

router.post("/annotations/preview-check", requireAuth, (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  const result = validateResearchAnnotation(req.body);

  res.set("Cache-Control", "no-store");

  return res.status(result.valid ? 200 : 400).json({
    valid: result.valid,
    errors: result.errors,
    preview_only: true,
    saved: false,
  });
});

module.exports = router;
