
const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("node:path");
const fs = require("node:fs/promises");

const pool = require("../db");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const uploadsDir = path.join(__dirname, "..", "uploads");

const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif"
];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },
    fileFilter(req, file, callback) {
        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error("Unsupported image format."));
        }
    }
}).single("photo");

router.use(requireAuth);

// Validation

function validEntryId(id) {
    return /^[1-9]\d*$/.test(id);
}

async function findEntry(id, userId) {
    const result = await pool.query(
        `
        SELECT id, image_url
        FROM entries
        WHERE id = $1 AND user_id = $2
        `,
        [id, userId]
    );

    return result.rows[0] || null;
}

// Get Photo

router.get("/:id/photo", async (req, res) => {
    const entryId = req.params.id;

    if (!validEntryId(entryId)) {
        return res.status(400).json({
            message: "Invalid entry ID."
        });
    }

    try {
        const entry = await findEntry(entryId, req.userId);

        if (!entry || !entry.image_url) {
            return res.status(404).json({
                message: "Photo not found."
            });
        }

        const filePath = path.join(
            uploadsDir,
            `${entryId}.webp`
        );

        const image = await fs.readFile(filePath);

        res.set("Cache-Control", "private, no-store");
        res.type("webp");
        res.send(image);
    } catch (error) {
        if (error.code === "ENOENT") {
            return res.status(404).json({
                message: "Photo not found."
            });
        }

        console.error("Get photo error:", error);

        res.status(500).json({
            message: "Could not load photo."
        });
    }
});

// Upload Photo

router.post("/:id/photo", (req, res, next) => {
    if (!validEntryId(req.params.id)) {
        return res.status(400).json({
            message: "Invalid entry ID."
        });
    }

    upload(req, res, error => {
        if (error) {
            const status = error.code === "LIMIT_FILE_SIZE"
                ? 413
                : 400;

            return res.status(status).json({
                message: error.code === "LIMIT_FILE_SIZE"
                    ? "Photo must be smaller than 5 MB."
                    : error.message
            });
        }

        next();
    });
}, async (req, res) => {
    const entryId = req.params.id;

    if (!req.file) {
        return res.status(400).json({
            message: "Choose a photo."
        });
    }

    try {
        const entry = await findEntry(entryId, req.userId);

        if (!entry) {
            return res.status(404).json({
                message: "Entry not found."
            });
        }

        let image;

        try {
            image = await sharp(req.file.buffer, {
                limitInputPixels: 25000000
            })
                .rotate()
                .resize({
                    width: 900,
                    height: 1200,
                    fit: "inside",
                    withoutEnlargement: true
                })
                .webp({ quality: 82 })
                .toBuffer();
        } catch (error) {
            return res.status(400).json({
                message: "Invalid image file."
            });
        }

        await fs.mkdir(uploadsDir, {
            recursive: true
        });

        const filePath = path.join(
            uploadsDir,
            `${entryId}.webp`
        );

        await fs.writeFile(filePath, image);

        const imageUrl = `/api/entries/${entryId}/photo`;

        await pool.query(
            `
            UPDATE entries
            SET image_url = $1,
                updated_at = NOW()
            WHERE id = $2 AND user_id = $3
            `,
            [imageUrl, entryId, req.userId]
        );

        res.json({
            message: "Photo uploaded successfully.",
            image_url: imageUrl
        });
    } catch (error) {
        console.error("Upload photo error:", error);

        res.status(500).json({
            message: "Could not upload photo."
        });
    }
});

// Delete Photo

router.delete("/:id/photo", async (req, res) => {
    const entryId = req.params.id;

    if (!validEntryId(entryId)) {
        return res.status(400).json({
            message: "Invalid entry ID."
        });
    }

    try {
        const result = await pool.query(
            `
            UPDATE entries
            SET image_url = NULL,
                updated_at = NOW()
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

        const filePath = path.join(
            uploadsDir,
            `${entryId}.webp`
        );

        await fs.rm(filePath, { force: true });

        res.json({
            message: "Photo deleted successfully."
        });
    } catch (error) {
        console.error("Delete photo error:", error);

        res.status(500).json({
            message: "Could not delete photo."
        });
    }
});

module.exports = router;
