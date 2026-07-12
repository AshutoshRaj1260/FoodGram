const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.routes");
const cors = require("cors");
const foodPartnerRoutes = require("./routes/food-partner.routes");
const storyRoutes = require("./routes/story.routes");
const passport = require("./services/passport.service");
const { globalLimiter } = require("./middlewares/rateLimiter.middleware");
const path = require("path");

const app = express();

// Trust proxy setting for deployment environments
const trustProxyValue =
  process.env.TRUST_PROXY === "true"
    ? 1
    : process.env.TRUST_PROXY === "false"
      ? false
      : Number(process.env.TRUST_PROXY) || false;
app.set("trust proxy", trustProxyValue);

// CORS configuration - must be before routes
const corsOptions = {
  origin:
    process.env.FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type"],
  maxAge: 3600,
};

app.use(cors(corsOptions));
app.options("/*path", cors(corsOptions)); // Enable preflight for all routes

app.use(globalLimiter);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get("/api", (req, res) => {
  res.send("API is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/food-partner", foodPartnerRoutes);
app.use("/api/stories", storyRoutes);

// --- Serve Frontend Static Files ---
// 1. Point Express to the React/Vite build directory
const frontendDistPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDistPath));

// 2. Catch-all route to hand off client-side routing back to React Router
app.get("/*path", (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { error: err }),
  });
});

module.exports = app;