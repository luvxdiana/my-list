
const express = require("express");
const path = require("node:path");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "My List server is running!"
    });
});

// Authentication
app.use("/api/auth", authRoutes);

// Frontend
app.use(express.static(path.join(__dirname, "../client")));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
