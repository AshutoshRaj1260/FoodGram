const express = require("express");
const router = express.Router();
const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post(
  "/",
  authMiddleware.authFoodPartnerMiddleware,
  upload.single("video"),
  foodController.createFood
);  

router.get("/", foodController.getFoodItems);

router.put(
  "/:id",
  authMiddleware.authFoodPartnerMiddleware,
  foodController.editFood
);

router.delete(
  "/:id",
  authMiddleware.authFoodPartnerMiddleware,
  foodController.deleteFood
);

router.post(
  "/like",
  authMiddleware.authUserMiddleware,
  foodController.likeFood
);

router.post(
  "/save",
  authMiddleware.authUserMiddleware,
  foodController.saveFood
);

router.get('/save',
  authMiddleware.authUserMiddleware,
  foodController.getSavedFood
);

module.exports = router;
