const mongoose = require("mongoose");
const { v4: uuid } = require("uuid");
const foodModel = require("../models/food.model");
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");
const storageService = require("../services/storage.service");
const { invalidateCache, getOrSetCache } = require("../services/redis.service");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const axios = require("axios");

async function createFood(req, res, next) {
  try {
    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid());

    const foodItem = await foodModel.create({
      name: req.body.name,
      video: fileUploadResult.url,
      description: req.body.description,
      foodPartner: req.foodPartner._id,
    });

    await invalidateCache(`partner:${req.foodPartner._id}`);
    await invalidateCache("all_food_items");
    await invalidateCache("trending_food_items");

    res.status(201).json({
      message: "Food Item Created Successfully",
      foodItem,
    });
  } catch (error) {
    next(error);
  }
}

async function getFoodItems(req, res, next) {
  try {
    // Check for optional authentication (accessToken cookie)
    const accessToken = req.cookies?.accessToken;
    let user = null;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        user = await userModel.findById(decoded.id);
      } catch (err) {
        user = null;
      }
    }

    // If we have an authenticated user with enough interactions, request personalized recommendations
    if (user) {
      const userLikes = await likeModel.countDocuments({ user: user._id });
      const userSaves = await saveModel.countDocuments({ user: user._id });
      const interactions = userLikes + userSaves;

      // Cold-start handling: require at least 3 interactions
      if (interactions >= 3) {
        try {
          const recommenderUrl = process.env.RECOMMENDER_URL || "http://localhost:8002";
          const resp = await axios.get(`${recommenderUrl}/recommend/${user._id}`, { params: { n: 50 }, timeout: 5000 });
          const recommendedIds = resp?.data?.recommendations || [];

          if (recommendedIds.length > 0) {
            // Fetch the recommended food items and preserve the recommender order
            const foods = await foodModel.find({ _id: { $in: recommendedIds } });
            const orderMap = new Map(recommendedIds.map((id, idx) => [String(id), idx]));
            foods.sort((a, b) => (orderMap.get(String(a._id)) ?? 9999) - (orderMap.get(String(b._id)) ?? 9999));

            return res.status(200).json({ message: "Personalized feed", foodItems: foods });
          }
        } catch (err) {
          console.error("Recommender service error:", err.message || err);
          // fall through to trending fallback
        }
      }
    }

    // Trending fallback for guests and cold-start users
    const { data: trendingItems, cache } = await getOrSetCache(
      "trending_food_items",
      async () =>
        await foodModel
          .find({})
          .sort({ likeCount: -1, saveCount: -1, createdAt: -1 })
          .limit(50),
      300
    );

    res.setHeader("X-Cache", cache);
    res.status(200).json({ message: "Trending feed", foodItems: trendingItems });
  } catch (error) {
    next(error);
  }
}

async function likeFood(req, res, next) {
  try {
    const { foodId } = req.body;
    const user = req.user;

    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        const isAlreadyLiked = await likeModel
          .findOne({
            user: user._id,
            food: foodId,
          })
          .session(session);

        if (isAlreadyLiked) {
          await likeModel.deleteOne({ user: user._id, food: foodId }).session(session);

          const updatedFood = await foodModel.findByIdAndUpdate(
            foodId,
            { $inc: { likeCount: -1 } },
            { new: true, session }
          );

          if (!updatedFood) {
            throw new Error("NOT_FOUND");
          }

          result = {
            status: 200,
            message: "Food item unliked successfully",
            liked: false,
            likeCount: updatedFood.likeCount,
            partnerId: updatedFood.foodPartner,
          };
        } else {
          await likeModel.create([{ user: user._id, food: foodId }], { session });

          const updatedFood = await foodModel.findByIdAndUpdate(
            foodId,
            { $inc: { likeCount: 1 } },
            { new: true, session }
          );

          if (!updatedFood) {
            throw new Error("NOT_FOUND");
          }

          result = {
            status: 200,
            message: "Food item liked successfully",
            liked: true,
            likeCount: updatedFood.likeCount,
            partnerId: updatedFood.foodPartner,
          };
        }
      });

      await invalidateCache(`partner:${result.partnerId}`);
      await invalidateCache("all_food_items");
      await invalidateCache("trending_food_items");

      res.status(result.status).json({
        message: result.message,
        liked: result.liked,
        likeCount: result.likeCount,
      });
    } catch (error) {
      if (error.message === "NOT_FOUND") {
        return res.status(404).json({ message: "Food item not found" });
      }
      if (error.code === 11000) {
        return res.status(200).json({
          message: "Food item liked successfully",
          liked: true,
        });
      }
      console.error("Error in likeFood transaction:", error);
      res.status(500).json({ message: "Internal Server Error" });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    next(error);
  }
}

async function saveFood(req, res, next) {
  try {
    const { foodId } = req.body;
    const user = req.user;

    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        const isAlreadySaved = await saveModel
          .findOne({
            user: user._id,
            food: foodId,
          })
          .session(session);

        if (isAlreadySaved) {
          await saveModel.deleteOne({ user: user._id, food: foodId }).session(session);

          const updatedFood = await foodModel.findByIdAndUpdate(
            foodId,
            { $inc: { saveCount: -1 } },
            { new: true, session }
          );

          if (!updatedFood) {
            throw new Error("NOT_FOUND");
          }

          result = {
            status: 200,
            message: "Food item unsaved successfully",
            saved: false,
            saveCount: updatedFood.saveCount,
            partnerId: updatedFood.foodPartner,
          };
        } else {
          await saveModel.create([{ user: user._id, food: foodId }], { session });

          const updatedFood = await foodModel.findByIdAndUpdate(
            foodId,
            { $inc: { saveCount: 1 } },
            { new: true, session }
          );

          if (!updatedFood) {
            throw new Error("NOT_FOUND");
          }

          result = {
            status: 200,
            message: "Food item saved successfully",
            saved: true,
            saveCount: updatedFood.saveCount,
            partnerId: updatedFood.foodPartner,
          };
        }
      });

      await invalidateCache(`partner:${result.partnerId}`);
      await invalidateCache("all_food_items");
      await invalidateCache("trending_food_items");

      res.status(result.status).json({
        message: result.message,
        saved: result.saved,
        saveCount: result.saveCount,
      });
    } catch (error) {
      if (error.message === "NOT_FOUND") {
        return res.status(404).json({ message: "Food item not found" });
      }
      if (error.code === 11000) {
        return res.status(200).json({
          message: "Food item saved successfully",
          saved: true,
        });
      }
      console.error("Error in saveFood transaction:", error);
      res.status(500).json({ message: "Internal Server Error" });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    next(error);
  }
}

async function getSavedFood(req, res, next) {
  try {
    const user = req.user;

    const savedFoods = await saveModel.find({ user: user._id }).populate("food");

    res.status(200).json({
      message: "Saved food items fetched successfully",
      savedFoods: savedFoods || [],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFood,
  getFoodItems,
  likeFood,
  saveFood,
  getSavedFood,
};
