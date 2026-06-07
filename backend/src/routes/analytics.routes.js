const express = require("express");
const{
    getFoodPartnerAnalytics,
} = require("../controllers/analytics.controller");

const {
    authFoodPartnerMiddleware,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
    "/food-partner/dashboard",
    authFoodPartnerMiddleware,
    getFoodPartnerAnalytics
);

module.exports = router;