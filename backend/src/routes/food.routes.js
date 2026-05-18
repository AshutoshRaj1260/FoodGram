const express = require("express");
const router = express.Router();
const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const multer = require("multer");
const catchAsync = require("../utils/catchAsync");

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post(
  "/",
  authMiddleware.authFoodPartnerMiddleware,
  upload.single("video"),
  catchAsync(foodController.createFood)
);  

router.get("/", authMiddleware.authUserMiddleware, catchAsync(foodController.getFoodItems));

router.post(
  "/like",
  authMiddleware.authUserMiddleware,
  catchAsync(foodController.likeFood)
);

router.post(
  "/save",
  authMiddleware.authUserMiddleware,
  catchAsync(foodController.saveFood)
);

router.get('/save',
  authMiddleware.authUserMiddleware,
  catchAsync(foodController.getSavedFood)
);

module.exports = router;
