const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.routes");
const cors = require("cors");
const foodPartnerRoutes = require("./routes/food-partner.routes");
const passport = require("./services/passport.service");
const { globalLimiter } = require("./middlewares/rateLimiter.middleware");

const app = express();

// Trust proxy setting for deployment environments
const trustProxyValue = process.env.TRUST_PROXY === 'true' ? 1 : 
                       process.env.TRUST_PROXY === 'false' ? false : 
                       Number(process.env.TRUST_PROXY) || false;
app.set('trust proxy', trustProxyValue);

app.use(
  cors({
    origin: process.env.FRONTEND_URL.replace(/\/$/, ""),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(globalLimiter);

app.use(express.json());
app.use(cookieParser());


app.use(passport.initialize());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/food-partner", foodPartnerRoutes);

module.exports = app;
