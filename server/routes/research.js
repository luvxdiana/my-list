// Research Routes

const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

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

    const consentRecorded = Boolean(participant?.consented_at);

    const canAnnotate = Boolean(
      participant &&
      participant.status === "active" &&
      consentRecorded &&
      participant.consent_version &&
      !participant.withdrawn_at,
    );

    res.set("Cache-Control", "no-store");

    return res.json({
      status: participant?.status || "not_invited",
      consent_recorded: consentRecorded,
      can_annotate: canAnnotate,
    });
  } catch (error) {
    console.error("Research status error:", error);

    return res.status(500).json({
      message: "Unable to check research status.",
    });
  }
});

module.exports = router;
