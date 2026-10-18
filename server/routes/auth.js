
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate user input
    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Username, email and password are required"
      });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanUsername.length < 2 || cleanUsername.length > 50) {
      return res.status(400).json({
        message: "Username must be 2-50 characters"
      });
    }

    if (
      cleanEmail.length > 255 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        message: "Invalid email address"
      });
    }

    if (
      password.length < 10 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message: "Password must be at least 10 characters and at most 72 bytes"
      });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Save user to PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
      [cleanUsername, cleanEmail, passwordHash]
    );

    // Send success response
    return res.status(201).json({
      message: "User registered successfully!",
      user: result.rows[0]
    });

  } catch (error) {
    // PostgreSQL unique constraint violation
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

module.exports = router;
