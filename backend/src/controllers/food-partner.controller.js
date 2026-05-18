const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');
const { getOrSetCache } = require('../services/redis.service');
const mongoose = require('mongoose');

async function getFoodPartnerById(req, res, next) {
  try {
    const foodPartnerId = req.params.id;

    if (!mongoose.isValidObjectId(foodPartnerId)) {
        return res.status(404).json({ message: 'Food partner not found' });
    }

    const cacheKey = `partner:${foodPartnerId}`;
    const { data: foodPartnerData, cache } = await getOrSetCache(cacheKey, async () => {
        const foodPartner = await foodPartnerModel
            .findById(foodPartnerId)
            .select('-password')
            .lean();
        if (!foodPartner) return null;

        const foodItemsByFoodPartner = await foodModel.find({ foodPartner: foodPartnerId });
        
        return {
            ...foodPartner,
            foodItems: foodItemsByFoodPartner
        };
    }, 300); // 5 minutes TTL

    if (!foodPartnerData) {
        return res.status(404).json({ message: 'Food partner not found' });
    }

    res.setHeader('X-Cache', cache);
    res.status(200).json({
        foodPartner: foodPartnerData
    });
  } catch (error) {
    next(error);
  }
}


module.exports = {
    getFoodPartnerById,
};