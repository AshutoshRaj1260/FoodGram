const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');
const { getOrSetCache } = require('../services/redis.service');

async function getFoodPartnerById(req, res) {
    const foodPartnerId = req.params.id;

    try {
        const cacheKey = `partner:${foodPartnerId}`;
        const { data: foodPartnerData, cache } = await getOrSetCache(cacheKey, async () => {
            const foodPartner = await foodPartnerModel.findById(foodPartnerId);
            if (!foodPartner) return null;

            const foodItemsByFoodPartner = await foodModel.find({ foodPartner: foodPartnerId });
            
            return {
                ...foodPartner.toObject(),
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
        console.error('Error in getFoodPartnerById:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


module.exports = {
    getFoodPartnerById,
};