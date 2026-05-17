const foodModel = require("../models/food.model");
const storageService = require("../services/storage.service");
const { v4: uuid } = require("uuid");
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");
const { invalidateCache, getOrSetCache } = require("../services/redis.service");
const mongoose = require("mongoose");

async function createFood(req, res) {
  const fileUploadResult = await storageService.uploadFile(
    req.file.buffer,
    uuid()
  );

  const foodItem = await foodModel.create({
    name: req.body.name,
    video: fileUploadResult.url,
    description: req.body.description,
    foodPartner: req.foodPartner._id,
  });

  // Invalidate cache for this partner and the global feed
  await invalidateCache(`partner:${req.foodPartner._id}`);
  await invalidateCache('all_food_items');

  res.status(201).json({
    message: "Food Item Created Successfully",
    foodItem,
  });
}

async function getFoodItems(req, res) {
  const { data: foodItems, cache } = await getOrSetCache('all_food_items', async () => {
    return await foodModel.find({});
  }, 300); // 5 minutes TTL

  res.setHeader('X-Cache', cache);
  res.status(200).json({
    message: "Food Items fetched successfully",
    foodItems,
  });
}

async function likeFood(req, res) {
  const { foodId } = req.body;
  const user = req.user;

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const isAlreadyLiked = await likeModel.findOne({
        user: user._id,
        food: foodId,
      }).session(session);

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
          partnerId: updatedFood.foodPartner
        };
      } else {
        // use .create([]) syntax for sessions with transactions
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
          partnerId: updatedFood.foodPartner
        };
      }
    });

    // Only reached if transaction commits
    await invalidateCache(`partner:${result.partnerId}`);
    await invalidateCache('all_food_items');

    res.status(result.status).json({ 
      message: result.message,
      liked: result.liked,
      likeCount: result.likeCount
    });

  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Food item not found" });
    }
    if (error.code === 11000) {
      // Duplicate key error: another request already created the relation.
      return res.status(200).json({ 
        message: "Food item liked successfully",
        liked: true
      });
    }
    console.error('Error in likeFood transaction:', error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await session.endSession();
  }
}

async function saveFood(req, res) {
  const { foodId } = req.body;
  const user = req.user;

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const isAlreadySaved = await saveModel.findOne({
        user: user._id,
        food: foodId,
      }).session(session);

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
          partnerId: updatedFood.foodPartner
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
          partnerId: updatedFood.foodPartner
        };
      }
    });

    // Only reached if transaction commits
    await invalidateCache(`partner:${result.partnerId}`);
    await invalidateCache('all_food_items');

    res.status(result.status).json({ 
      message: result.message,
      saved: result.saved,
      saveCount: result.saveCount
    });

  } catch (error) {
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ message: "Food item not found" });
    }
    if (error.code === 11000) {
      // Duplicate key error: another request already saved the item.
      return res.status(200).json({ 
        message: "Food item saved successfully",
        saved: true
      });
    }
    console.error('Error in saveFood transaction:', error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await session.endSession();
  }
}

async function getSavedFood(req, res) {
  const user = req.user;

  const savedFoods = await saveModel.find({ user: user._id }).populate("food");

  // Return an empty array instead of 404 so the frontend doesn't throw an error
  res.status(200).json({
    message: "Saved food items fetched successfully",
    savedFoods: savedFoods || [],
  });
}

module.exports = {
  createFood,
  getFoodItems,
  likeFood,
  saveFood,
  getSavedFood,
};
