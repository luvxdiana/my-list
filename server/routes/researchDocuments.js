// Research Documents Routes

const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const PREVIEW_VERSION = "TEST-PREVIEW-v1";

// Preview Document

router.get("/preview", requireAuth, async (req, res) => {
  res.set("Cache-Control", "no-store");

  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({
      message: "Not found.",
    });
  }

  try {
    // Research Status

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

    // Access Control

    const invited = Boolean(
      participant &&
      participant.status === "invited" &&
      participant.consented_at === null &&
      participant.withdrawn_at === null,
    );

    const activePreview = Boolean(
      participant &&
      participant.status === "active" &&
      participant.consent_version === PREVIEW_VERSION &&
      participant.consented_at !== null &&
      participant.withdrawn_at === null,
    );

    if (!invited && !activePreview) {
      return res.status(403).json({
        message: "Research preview document access denied.",
      });
    }

    // Load Document

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
      },
    });
  } catch (error) {
    console.error("Research document error:", error);

    return res.status(500).json({
      message: "Unable to load research document.",
    });
  }
});

module.exports = router;
