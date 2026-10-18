
const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

const categories = ["anime", "series", "movie", "book", "game"];

const statuses = ["completed", "incomplete", "dropped"];

// Validation

function validateEntry(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "Invalid entry data.";
    }

    const { category, title, status, rating, length } = body;

    if (!categories.includes(category)) {
        return "Invalid category.";
    }

    if (
        typeof title !== "string" ||
        title.trim().length === 0 ||
        title.trim().length > 255
    ) {
        return "Title must contain 1 to 255 characters.";
    }

    if (!statuses.includes(status)) {
        return "Invalid status.";
    }

    const textLimits = {
        genre: 100,
        description: 20000,
        review: 20000
    };

    for (const [field, limit] of Object.entries(textLimits)) {
        const value = body[field];

        if (value === undefined || value === null) {
            continue;
        }

        if (typeof value !== "string" || value.length > limit) {
            return `Invalid ${field}. Maximum length: ${limit}.`;
        }
    }

    if (rating !== null && rating !== undefined && rating !== "") {
        if (
            typeof rating !== "number" ||
            !Number.isFinite(rating) ||
            rating < 0.5 ||
            rating > 5 ||
            !Number.isInteger(rating * 2)
        ) {
            return "Rating must be between 0.5 and 5 in steps of 0.5.";
        }
    }

    if (length !== null && length !== undefined && length !== "") {
        if (
            typeof length !== "number" ||
            !Number.isFinite(length) ||
            length < 0 ||
            length > 1000000
        ) {
            return "Invalid length.";
        }

        if (category === "game") {
            if (!Number.isInteger(Math.round(length * 10)) ||
                Math.abs(length * 10 - Math.round(length * 10)) > 0.000001) {
                return "Playtime must use steps of 0.1 hours.";
            }
        } else if (!Number.isInteger(length)) {
            return "Length must be a whole number.";
        }
    }

    return null;
}

// Entries

router.get("/", async (req, res) => {
    const category = req.query.category;

    if (category !== undefined && !categories.includes(category)) {
        return res.status(400).json({
            message: "Invalid category."
        });
    }

    try {
        const values = [req.userId];

        let query = `
            SELECT
                id,
                title,
                category,
                genre,
                description,
                review,
                image_url,
                status,
                rating,
                total_episodes,
                total_pages,
                duration_minutes,
                playtime_hours,
                created_at,
                updated_at
            FROM entries
            WHERE user_id = $1
        `;

        if (category) {
            query += " AND category = $2";
            values.push(category);
        }

        query += " ORDER BY created_at DESC, id DESC";

        const result = await pool.query(query, values);

        res.json({
            entries: result.rows
        });
    } catch (error) {
        console.error("Get entries error:", error);

        res.status(500).json({
            message: "Could not load entries."
        });
    }
});

// Save

router.post("/", async (req, res) => {
    const errorMessage = validateEntry(req.body);

    if (errorMessage) {
        return res.status(400).json({
            message: errorMessage
        });
    }

    const {
        category,
        title,
        genre,
        description,
        review,
        status,
        rating,
        length
    } = req.body;

    const mediaLength =
        length === undefined || length === null || length === ""
            ? null
            : length;

    let totalEpisodes = null;
    let totalPages = null;
    let durationMinutes = null;
    let playtimeHours = null;

    if (category === "anime" || category === "series") {
        totalEpisodes = mediaLength;
    }

    if (category === "book") {
        totalPages = mediaLength;
    }

    if (category === "movie") {
        durationMinutes = mediaLength;
    }

    if (category === "game") {
        playtimeHours = mediaLength;
    }

    try {
        const result = await pool.query(
            `
            INSERT INTO entries (
                user_id,
                title,
                category,
                genre,
                description,
                review,
                status,
                rating,
                total_episodes,
                total_pages,
                duration_minutes,
                playtime_hours
            )
            VALUES (
                $1, $2, $3, $4,
                $5, $6, $7, $8,
                $9, $10, $11, $12
            )
            RETURNING *
            `,
            [
                req.userId,
                title.trim(),
                category,
                genre?.trim() || null,
                description?.trim() || null,
                review?.trim() || null,
                status,
                rating === undefined || rating === null || rating === ""
                    ? null
                    : rating,
                totalEpisodes,
                totalPages,
                durationMinutes,
                playtimeHours
            ]
        );

        res.status(201).json({
            message: "Entry created successfully.",
            entry: result.rows[0]
        });
    } catch (error) {
        console.error("Create entry error:", error);

        res.status(500).json({
            message: "Could not save entry."
        });
    }
});


// Update

router.put("/:id", async (req, res) => {
    const entryId = req.params.id;

    if (!/^[1-9]\d*$/.test(entryId)) {
        return res.status(400).json({
            message: "Invalid entry ID."
        });
    }

    const errorMessage = validateEntry(req.body);

    if (errorMessage) {
        return res.status(400).json({
            message: errorMessage
        });
    }

    const {
        category,
        title,
        genre,
        description,
        review,
        status,
        rating,
        length
    } = req.body;

    const mediaLength =
        length === undefined || length === null || length === ""
            ? null
            : length;

    const totalEpisodes =
        category === "anime" || category === "series"
            ? mediaLength
            : null;

    const totalPages =
        category === "book" ? mediaLength : null;

    const durationMinutes =
        category === "movie" ? mediaLength : null;

    const playtimeHours =
        category === "game" ? mediaLength : null;

    try {
        const result = await pool.query(
            `
            UPDATE entries
            SET
            title = $1,
            category = $2,
            genre = $3,
            description = $4,
            review = $5,
            status = $6,
             rating = $7,
             total_episodes = $8,
             total_pages = $9,
             duration_minutes = $10,
             playtime_hours = $11,
             updated_at = NOW()
    WHERE id = $12 AND user_id = $13
    RETURNING *
            `,
            [
                title.trim(),
                category,
                genre?.trim() || null,
                description?.trim() || null,
                review?.trim() || null,
                status,
                rating === undefined || rating === null || rating === ""
                    ? null
                    : rating,
                totalEpisodes,
                totalPages,
                durationMinutes,
                playtimeHours,
                entryId,
                req.userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Entry not found."
            });
        }

        res.json({
            message: "Entry updated successfully.",
            entry: result.rows[0]
        });
    } catch (error) {
        console.error("Update entry error:", error);

        res.status(500).json({
            message: "Could not update entry."
        });
    }
});

// Delete

router.delete("/:id", async (req, res) => {
    const entryId = req.params.id;

    if (!/^[1-9]\d*$/.test(entryId)) {
        return res.status(400).json({
            message: "Invalid entry ID."
        });
    }

    try {
        const result = await pool.query(
            `
            DELETE FROM entries
            WHERE id = $1 AND user_id = $2
            RETURNING id
            `,
            [entryId, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Entry not found."
            });
        }

        res.json({
            message: "Entry deleted successfully."
        });
    } catch (error) {
        console.error("Delete entry error:", error);

        res.status(500).json({
            message: "Could not delete entry."
        });
    }
});

module.exports = router;
