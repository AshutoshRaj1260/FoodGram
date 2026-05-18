const foodPartnerModel = require("../models/foodpartner.model");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authFoodPartnerMiddleware(req, res, next) {
  const accessToken = req.cookies.accessToken;
  
  if (!accessToken) {
    return res.status(401).json({
      message: "Login to access this resource",
    });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const foodPartner = await foodPartnerModel.findById(decoded.id);
    req.foodPartner = foodPartner;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Token. Please login again.",
    });
  }
}

async function authUserMiddleware(req, res, next) {
  const accessToken = req.cookies.accessToken;
  
  if (!accessToken) {
    return res.status(401).json({
      message: "Login to access this resource",
    });
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
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
