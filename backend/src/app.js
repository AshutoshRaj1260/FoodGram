const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.routes");
const cors = require("cors");
const foodPartnerRoutes = require("./routes/food-partner.routes");
const passport = require("./services/passport.service");
const path = require("path");
const { globalLimiter } = require("./middlewares/rateLimiter.middleware");

const app = express();

// Trust proxy setting for deployment environments
const trustProxyValue = process.env.TRUST_PROXY === 'true' ? 1 : 
                       process.env.TRUST_PROXY === 'false' ? false : 
                       Number(process.env.TRUST_PROXY) || false;
app.set('trust proxy', trustProxyValue);

app.use(
  cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : undefined,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

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

// --- Serve Frontend Static Files ---
// 1. Point Express to the React/Vite build directory
const frontendDistPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDistPath));

// 2. Catch-all route to hand off client-side routing back to React Router
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { error: err })
  });
});

module.exports = app;
