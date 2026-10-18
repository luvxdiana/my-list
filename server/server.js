
const express = require("express");
const path = require("node:path");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const entriesRoutes = require("./routes/entries");

const app = express();
const PORT = process.env.PORT || 3000;

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

// Frontend

app.use(express.static(path.join(__dirname, "../client")));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
