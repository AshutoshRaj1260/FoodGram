const foodPartnerModel = require("../models/foodpartner.model");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authFoodPartnerMiddleware(req, res, next) {
  try {
    const accessToken = req.cookies?.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({
        message: "Login to access this resource",
      });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const foodPartner = await foodPartnerModel.findById(decoded.id);
    
    if (!foodPartner) {
      return res.status(401).json({
        message: "Partner not found. Please login again.",
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
  try {
    const accessToken = req.cookies?.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({
        message: "Login to access this resource",
      });
    }
    
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        message: "User not found. Please login again.",
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
