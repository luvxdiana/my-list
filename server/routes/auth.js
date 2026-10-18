
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const requireAuth = require("../middleware/requireAuth");

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


/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    // Check input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user in database
    const result = await pool.query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Create signed session token
    const token = jwt.sign(
      { sub: String(user.id) },
      process.env.JWT_SECRET,
      { expiresIn: "7d", algorithm: "HS256" }
    );

    // Save token in an HttpOnly cookie
    res.cookie("mylist_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    return res.status(200).json({
      message: "Login successful!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});


/* GET CURRENT USER */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email
       FROM users
       WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      user: result.rows[0]
    });

  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});


/* LOGOUT */
router.post("/logout", (req, res) => {
  res.clearCookie("mylist_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  return res.status(200).json({
    message: "Logged out successfully!"
  });
});

module.exports = router;
