const express = require('express');
const foodPartnerController = require('../controllers/food-partner.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

router.get("/:id",
    authMiddleware.authUserMiddleware,
    catchAsync(foodPartnerController.getFoodPartnerById)
)

module.exports = router;