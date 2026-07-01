const express = require('express');
const foodPartnerController = require('../controllers/food-partner.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();


async function authAnyMiddleware(req, res, next) {
  const jwt = require('jsonwebtoken');
  const foodPartnerModel = require('../models/foodpartner.model');
  const userModel = require('../models/user.model');

  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    return res.status(401).json({ message: 'Login to access this resource' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    const partner = await foodPartnerModel.findById(decoded.id);
    if (partner) {
      req.foodPartner = partner;
      return next();
    }

    const user = await userModel.findById(decoded.id);
    if (user) {
      req.user = user;
      return next();
    }

    return res.status(401).json({ message: 'Account not found. Please login again.' });
  } catch {
    return res.status(401).json({ message: 'Invalid token. Please login again.' });
  }
}

router.get('/:id', authAnyMiddleware, foodPartnerController.getFoodPartnerById);

module.exports = router;