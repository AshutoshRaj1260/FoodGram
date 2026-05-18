const foodModel = require("../models/food.model");
const storageService = require("../services/storage.service");
const { v4: uuid } = require("uuid");
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");

async function createFood(req, res, next) {
  try {
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
  const foodItems = await foodModel.find({});
  res.status(200).json({
    message: "Food Items fetched successfully",
    foodItems,
  });
  } catch (error) {
    next(error);
  }
}

async function likeFood(req, res, next) {
  try {
  const { foodId } = req.body;
  const user = req.user;

  const isAlreadyLiked = await likeModel.findOne({
    user: user._id,
    food: foodId,
  });

  if (isAlreadyLiked) {
    await likeModel.deleteOne({ user: user._id, food: foodId });

    const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: -1 } }, { new: true });
    res.status(200).json({ 
      message: "Food item unliked successfully",
      liked: false,
      likeCount: updatedFood.likeCount
    });
  } else {
    await likeModel.create({ user: user._id, food: foodId });
    const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: 1 } }, { new: true });
    res.status(200).json({ 
      message: "Food item liked successfully",
      liked: true,
      likeCount: updatedFood.likeCount
    });
  }
  } catch (error) {
    next(error);
  }
}

async function saveFood(req, res, next) {
  try {
  const { foodId } = req.body;
  const user = req.user;

  const isAlreadySaved = await saveModel.findOne({
    user: user._id,
    food: foodId,
  });
  if (isAlreadySaved) {
    await saveModel.deleteOne({ user: user._id, food: foodId });

    const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { saveCount: -1 } }, { new: true });
    res.status(200).json({ 
      message: "Food item unsaved successfully",
      saved: false,
      saveCount: updatedFood.saveCount
    });
  } else {
    await saveModel.create({ user: user._id, food: foodId });
    const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { saveCount: 1 } }, { new: true });
    res.status(200).json({ 
      message: "Food item saved successfully",
      saved: true,
      saveCount: updatedFood.saveCount
    });
  }
  } catch (error) {
    next(error);
  }
}

async function getSavedFood(req, res, next) {
  try {
  const user = req.user;

  const savedFoods = await saveModel.find({ user: user._id }).populate("food");

  // Return an empty array instead of 404 so the frontend doesn't throw an error
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
