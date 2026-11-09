// Catalog Administrator Middleware

const pool = require("../db");

// Require Catalog Administrator

async function requireCatalogAdmin(req, res, next) {
  // Authentication Check

  if (typeof req.userId !== "string" || !/^[1-9]\d*$/.test(req.userId)) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  try {
    // Administrator Check

    const result = await pool.query(
      `
        SELECT
          is_admin

        FROM public.users

        WHERE id = $1

        LIMIT 1;
      `,
      [req.userId],
    );

    const user = result.rows[0];

    // Access Denied

    if (!user || user.is_admin !== true) {
      return res.status(403).json({
        message: "Administrator access required.",
      });
    }

    // Access Granted

    return next();
  } catch (error) {
    console.error("Catalog administrator verification error:", error);

    return res.status(500).json({
      message: "Unable to verify administrator permissions.",
    });
  }
}

module.exports = requireCatalogAdmin;
