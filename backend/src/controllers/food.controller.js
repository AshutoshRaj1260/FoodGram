const foodModel = require("../models/food.model");
const storageService = require("../services/storage.service");
const { v4: uuid } = require("uuid");
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");

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
  res.status(201).json({
    message: "Food Item Created Successfully",
    foodItem,
  });
}

async function getFoodItems(req, res) {
  const foodItems = await foodModel.find({});
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

    await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: -1 } });
    res.status(200).json({ message: "Food item unliked successfully" });
  } else {
    await likeModel.create({ user: user._id, food: foodId });
    await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: 1 } });
    res.status(200).json({ message: "Food item liked successfully" });
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

    await foodModel.findByIdAndUpdate(foodId, { $inc: { saveCount: -1 } });
    res.status(200).json({ message: "Food item unsaved successfully" });
  } else {
    await saveModel.create({ user: user._id, food: foodId });
    await foodModel.findByIdAndUpdate(foodId, { $inc: { saveCount: 1 } });
    res.status(200).json({ message: "Food item saved successfully" });
  }
}

async function getSavedFood(req, res) {
  const user = req.user;

  const savedFoods = await saveModel.find({ user: user._id }).populate("food");

  if (!savedFoods || savedFoods.length === 0) {
    return res.status(404).json({
      message: "No saved food items found",
    });
  }

  res.status(200).json({
    message: "Saved food items fetched successfully",
    savedFoods,
  });
}

module.exports = {
  createFood,
  getFoodItems,
  likeFood,
  saveFood,
  getSavedFood,
};
