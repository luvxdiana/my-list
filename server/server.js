// Dependencies

const helmet = require("helmet");
const express = require("express");
const path = require("node:path");
const cookieParser = require("cookie-parser");

// Routes

const authRoutes = require("./routes/auth");
const entriesRoutes = require("./routes/entries");
const photoRoutes = require("./routes/photos");
const compassRoutes = require("./routes/compass");
const researchRoutes = require("./routes/research");
const onboardingRoutes = require("./routes/onboarding");

// App

const app = express();

const PORT = process.env.PORT || 3000;

// Security

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:", "blob:"],
        "upgrade-insecure-requests":
          process.env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);

const allowedOrigin = process.env.APP_ORIGIN || `http://localhost:${PORT}`;

if (process.env.NODE_ENV === "production" && !process.env.APP_ORIGIN) {
  throw new Error("APP_ORIGIN is required in production.");
}

app.use("/api", (req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }

  if (req.get("Origin") !== allowedOrigin) {
    return res.status(403).json({
      message: "Request origin not allowed.",
    });
  }

  next();
});

// Middleware

app.use(
  express.json({
    limit: "100kb",
  }),
);

app.use(cookieParser());

// Health

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "My List server is running!",
  });
});

// API Routes

app.use("/api/auth", authRoutes);
app.use("/api/entries", entriesRoutes);
app.use("/api/entries", photoRoutes);
app.use("/api/compass", compassRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/compass/onboarding", onboardingRoutes);

// Static Files

app.use(express.static(path.join(__dirname, "../client")));

// Start Server

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
