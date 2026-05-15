const foodPartnerModel = require("../models/foodpartner.model");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authFoodPartnerMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "Login to access this resource",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const foodPartner = await foodPartnerModel.findById(decoded.id);

    if (!foodPartner) {
      return res.status(401).json({
        message: "Account not found. Please login again.",
      });
    }

    if (!foodPartner.isEmailVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email first",
      });
    }

    req.foodPartner = foodPartner;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Token. Please login again.",
    });
  }
}

async function authUserMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "Login to access this resource",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "Account not found. Please login again.",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email first",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Token. Please login again.",
    });
  }
}

module.exports = {
  authFoodPartnerMiddleware,
  authUserMiddleware
};
