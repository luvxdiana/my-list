// Research Routes

const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const {
  validateResearchAnnotation,
  EMOTION_CODES,
} = require("../services/validateResearchAnnotation");

const router = express.Router();

const PREVIEW_VERSION = "TEST-PREVIEW-v1";
const UNIQUE_TEST_ANNOTATION_INDEX = "uq_research_test_batches_annotator_media";

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

router.post("/annotations/preview-check", requireAuth, async (req, res) => {
  res.set("Cache-Control", "no-store");

  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  try {
    // Research Preview Access

    const accessResult = await pool.query(
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

    const participant = accessResult.rows[0] || null;

    const allowed = Boolean(
      participant &&
      !participant.withdrawn_at &&
      (participant.status === "invited" ||
        (participant.status === "active" &&
          participant.consent_version === PREVIEW_VERSION &&
          participant.consented_at)),
    );

    if (!allowed) {
      return res.status(403).json({
        message: "Research preview access denied.",
        preview_only: true,
        saved: false,
      });
    }

    // Annotation Validation

    const result = validateResearchAnnotation(req.body);

    return res.status(result.valid ? 200 : 400).json({
      valid: result.valid,
      errors: result.errors,
      preview_only: true,
      saved: false,
    });
  } catch (error) {
    console.error("Research preview validation error:", error);

    return res.status(500).json({
      message: "Unable to validate annotation preview.",
      preview_only: true,
      saved: false,
    });
  }
});

// Test Annotation Save

router.post("/annotations/test-save", requireAuth, async (req, res) => {
  res.set("Cache-Control", "no-store");

  // Test Mode

  if (
    process.env.NODE_ENV !== "development" ||
    process.env.RESEARCH_TEST_WRITES_ENABLED !== "true"
  ) {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  // Validation

  const validation = validateResearchAnnotation(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      valid: false,
      errors: validation.errors,
      saved: false,
    });
  }

  let client;
  let transactionStarted = false;

  try {
    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    // Test Participant

    const participantResult = await client.query(
      `
                SELECT id
                FROM public.research_annotators
                WHERE user_id = $1
                  AND annotator_code = 'TEST002'
                  AND status = 'invited'
                  AND consented_at IS NULL
                  AND withdrawn_at IS NULL
                FOR UPDATE
                `,
      [req.userId],
    );

    if (participantResult.rowCount !== 1) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(403).json({
        message: "Test annotation access denied.",
        saved: false,
      });
    }

    const annotatorId = participantResult.rows[0].id;

    // Media

    const mediaResult = await client.query(
      `
                SELECT id
                FROM public.media_catalog
                WHERE id = $1
                  AND category IN ('movie', 'series')
                `,
      [req.body.media_id],
    );

    if (mediaResult.rowCount !== 1) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        message: "Media item not found.",
        saved: false,
      });
    }

    // Duplicate Check

    const existingResult = await client.query(
      `
                SELECT id
                FROM public.research_test_annotation_batches
                WHERE annotator_id = $1
                  AND media_id = $2
                LIMIT 1
                `,
      [annotatorId, req.body.media_id],
    );

    if (existingResult.rowCount > 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        message: "This test participant has already " + "annotated this title.",
        saved: false,
      });
    }

    // Emotion IDs

    const emotionsResult = await client.query(
      `
                SELECT id, code
                FROM public.emotions
                WHERE code = ANY($1::text[])
                `,
      [EMOTION_CODES],
    );

    if (emotionsResult.rows.length !== EMOTION_CODES.length) {
      throw new Error("Required emotional categories are missing.");
    }

    const emotionIds = new Map(
      emotionsResult.rows.map((emotion) => [emotion.code, emotion.id]),
    );

    // Annotation Batch

    const batchResult = await client.query(
      `
                INSERT INTO public.research_test_annotation_batches (
                    annotator_id,
                    media_id,
                    evidence_source,
                    annotation_note,
                    is_test_data
                )
                VALUES ($1, $2, $3, $4, TRUE)
                RETURNING id
                `,
      [
        annotatorId,
        req.body.media_id,
        req.body.evidence_source,
        req.body.annotation_note || null,
      ],
    );

    const batchId = batchResult.rows[0].id;

    // Emotional Ratings

    for (const rating of req.body.ratings) {
      await client.query(
        `
                    INSERT INTO public.research_test_annotation_ratings (
                        batch_id,
                        emotion_id,
                        intensity,
                        confidence
                    )
                    VALUES ($1, $2, $3, $4)
                    `,
        [
          batchId,
          emotionIds.get(rating.emotion_code),
          rating.intensity,
          rating.confidence,
        ],
      );
    }

    // Commit

    await client.query("COMMIT");
    transactionStarted = false;

    return res.status(201).json({
      message: "Test annotation saved successfully.",
      saved: true,
      test_only: true,
      batch_id: batchId,
      ratings_saved: req.body.ratings.length,
    });
  } catch (error) {
    // Rollback

    if (transactionStarted && client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Research rollback error:", rollbackError);
      }
    }

    // Unique Constraint

    if (
      error.code === "23505" &&
      error.constraint === UNIQUE_TEST_ANNOTATION_INDEX
    ) {
      return res.status(409).json({
        message: "This test participant has already " + "annotated this title.",
        saved: false,
      });
    }

    // Other Errors

    console.error("Research test annotation error:", error);

    return res.status(500).json({
      message: "Unable to save test annotation.",
      saved: false,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
