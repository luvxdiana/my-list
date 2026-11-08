// Research Documents Routes

const express = require("express");
const { createHash } = require("node:crypto");

const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const PREVIEW_VERSION = "TEST-PREVIEW-v1";

// Document Hash

function getDocumentHash(document) {
  const content = {
    version: document.version_code,
    kind: document.consent_kind,
    title: document.title,
    text: document.document_text,
    status: document.status,
  };

  return createHash("sha256").update(JSON.stringify(content)).digest("hex");
}

// Preview Access

function hasPreviewAccess(participant) {
  if (!participant || participant.withdrawn_at !== null) {
    return false;
  }

  const invited =
    participant.status === "invited" &&
    participant.consented_at === null &&
    participant.consent_version === null;

  const activePreview =
    participant.status === "active" &&
    participant.consent_version === PREVIEW_VERSION &&
    participant.consented_at !== null;

  return invited || activePreview;
}

// Preview Document

router.get("/preview", requireAuth, async (req, res) => {
  res.set("Cache-Control", "no-store");

  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  try {
    // Participant

    const participantResult = await pool.query(
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

    const participant = participantResult.rows[0] || null;

    if (!hasPreviewAccess(participant)) {
      return res.status(403).json({
        message: "Research preview document access denied.",
      });
    }

    // Document

    const documentResult = await pool.query(
      `
      SELECT
        version_code,
        consent_kind,
        title,
        document_text,
        status
      FROM public.research_consent_documents
      WHERE consent_kind = 'preview'
        AND version_code = $1
      LIMIT 1
      `,
      [PREVIEW_VERSION],
    );

    if (documentResult.rowCount !== 1) {
      return res.status(404).json({
        message: "Research preview document not found.",
      });
    }

    const document = documentResult.rows[0];

    // Response

    return res.status(200).json({
      preview_only: true,
      document: {
        version: document.version_code,
        kind: document.consent_kind,
        title: document.title,
        text: document.document_text,
        status: document.status,
        hash: getDocumentHash(document),
      },
    });
  } catch (error) {
    console.error("Research document error:", error);

    return res.status(500).json({
      message: "Unable to load research document.",
    });
  }
});

// Preview Acknowledgement

router.post("/preview-acknowledge", requireAuth, async (req, res) => {
  res.set("Cache-Control", "no-store");

  // Development Only

  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  // Request Validation

  const version = req.body?.version;
  const documentHash = req.body?.document_hash;

  if (
    version !== PREVIEW_VERSION ||
    typeof documentHash !== "string" ||
    !/^[a-f0-9]{64}$/.test(documentHash)
  ) {
    return res.status(400).json({
      message: "Invalid preview acknowledgement request.",
      saved: false,
    });
  }

  let client;
  let transactionStarted = false;

  try {
    client = await pool.connect();

    await client.query("BEGIN");
    transactionStarted = true;

    // Participant

    const participantResult = await client.query(
      `
        SELECT
          id,
          status,
          consent_version,
          consented_at,
          withdrawn_at
        FROM public.research_annotators
        WHERE user_id = $1
        LIMIT 1
        FOR UPDATE
        `,
      [req.userId],
    );

    const participant = participantResult.rows[0] || null;

    if (!hasPreviewAccess(participant)) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(403).json({
        message: "Research preview access denied.",
        preview_only: true,
        saved: false,
      });
    }

    // Document

    const documentResult = await client.query(
      `
        SELECT
          version_code,
          consent_kind,
          title,
          document_text,
          status
        FROM public.research_consent_documents
        WHERE consent_kind = 'preview'
          AND version_code = $1
        LIMIT 1
        FOR SHARE
        `,
      [PREVIEW_VERSION],
    );

    if (documentResult.rowCount !== 1) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(404).json({
        message: "Research preview document not found.",
        preview_only: true,
        saved: false,
      });
    }

    const document = documentResult.rows[0];

    // Document Version Verification

    if (
      document.status !== "draft" ||
      getDocumentHash(document) !== documentHash
    ) {
      await client.query("ROLLBACK");
      transactionStarted = false;

      return res.status(409).json({
        message:
          "The research preview document has changed. " +
          "Please reload the page and review it again.",
        preview_only: true,
        saved: false,
      });
    }

    // Record Acknowledgement

    const eventResult = await client.query(
      `
        INSERT INTO public.research_consent_events (
          annotator_id,
          event_type,
          consent_kind,
          consent_version,
          is_test_event
        )
        VALUES (
          $1,
          'acknowledged',
          'preview',
          $2,
          TRUE
        )

        ON CONFLICT (
          annotator_id,
          consent_kind,
          consent_version
        )
        WHERE event_type = 'acknowledged'
        DO NOTHING

        RETURNING
          id,
          recorded_at
        `,
      [participant.id, PREVIEW_VERSION],
    );

    // Commit

    await client.query("COMMIT");
    transactionStarted = false;

    // Existing Acknowledgement

    if (eventResult.rowCount === 0) {
      return res.status(200).json({
        message: "Preview acknowledgement already recorded.",
        preview_only: true,
        saved: false,
        already_recorded: true,
        document_version: PREVIEW_VERSION,
      });
    }

    // New Acknowledgement

    return res.status(201).json({
      message: "Preview acknowledgement recorded successfully.",
      preview_only: true,
      saved: true,
      already_recorded: false,
      document_version: PREVIEW_VERSION,
      event_id: eventResult.rows[0].id,
      recorded_at: eventResult.rows[0].recorded_at,
    });
  } catch (error) {
    // Rollback

    if (transactionStarted && client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Research acknowledgement rollback error:",
          rollbackError,
        );
      }
    }

    console.error("Research acknowledgement error:", error);

    return res.status(500).json({
      message: "Unable to record preview acknowledgement.",
      preview_only: true,
      saved: false,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
