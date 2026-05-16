const foodModel = require("../models/food.model");
const storageService = require("../services/storage.service");
const { v4: uuid } = require("uuid");
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");
const { invalidateCache, getOrSetCache } = require("../services/redis.service");

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

  const isAlreadyLiked = await likeModel.findOne({
    user: user._id,
    food: foodId,
  });

  if (isAlreadyLiked) {
    await likeModel.deleteOne({ user: user._id, food: foodId });

    const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: -1 } }, { new: true });
    
    await invalidateCache(`partner:${updatedFood.foodPartner}`);
    await invalidateCache('all_food_items');

    res.status(200).json({ 
      message: "Food item unliked successfully",
      liked: false,
      likeCount: updatedFood.likeCount
    });
  } else {
    await likeModel.create({ user: user._id, food: foodId });
    const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: 1 } }, { new: true });
    
    await invalidateCache(`partner:${updatedFood.foodPartner}`);
    await invalidateCache('all_food_items');

    res.status(200).json({ 
      message: "Food item liked successfully",
      liked: true,
      likeCount: updatedFood.likeCount
    });
  }
}

async function saveFood(req, res) {
  const { foodId } = req.body;
  const user = req.user;

  const isAlreadySaved = await saveModel.findOne({
    user: user._id,
    food: foodId,
  });
  if (isAlreadySaved) {
    await saveModel.deleteOne({ user: user._id, food: foodId });

    const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { saveCount: -1 } }, { new: true });
    
    await invalidateCache(`partner:${updatedFood.foodPartner}`);
    await invalidateCache('all_food_items');

    res.status(200).json({ 
      message: "Food item unsaved successfully",
      saved: false,
      saveCount: updatedFood.saveCount
    });
  } else {
    await saveModel.create({ user: user._id, food: foodId });
    const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { saveCount: 1 } }, { new: true });
    
    await invalidateCache(`partner:${updatedFood.foodPartner}`);
    await invalidateCache('all_food_items');

    res.status(200).json({ 
      message: "Food item saved successfully",
      saved: true,
      saveCount: updatedFood.saveCount
    });
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
