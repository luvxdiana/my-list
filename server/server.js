const helmet = require("helmet");
const express = require("express");
const path = require("node:path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const entriesRoutes = require("./routes/entries");
const photoRoutes = require("./routes/photos");


const app = express();
const PORT = process.env.PORT || 3000;


// Security Headers

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "img-src": ["'self'", "data:", "blob:"],
            "upgrade-insecure-requests":
                process.env.NODE_ENV === "production" ? [] : null
        }
    }
}));



// Origin Protection

const allowedOrigin =
    process.env.APP_ORIGIN || `http://localhost:${PORT}`;

if (process.env.NODE_ENV === "production" && !process.env.APP_ORIGIN) {
    throw new Error("APP_ORIGIN is required in production.");
}

app.use("/api", (req, res, next) => {
    const protectedMethods = ["POST", "PUT", "PATCH", "DELETE"];

    if (!protectedMethods.includes(req.method)) {
        return next();
    }

    const origin = req.get("Origin");

    if (origin !== allowedOrigin) {
        return res.status(403).json({
            message: "Request origin not allowed."
        });
    }

    next();
});


app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// Health

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "My List server is running!"
    });
});

// Authentication

app.use("/api/auth", authRoutes);

// Entries

app.use("/api/entries", entriesRoutes);
app.use("/api/entries", photoRoutes);


// Frontend

app.use(express.static(path.join(__dirname, "../client")));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
