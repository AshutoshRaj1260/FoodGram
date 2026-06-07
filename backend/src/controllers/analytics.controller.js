const foodModel = require("../models/food.model");

async function getFoodPartnerAnalytics(req,res){
    try{
        const foodPartnerId = req.foodPartner._id;

        const summaryResult = await foodModel.aggregate([
            {
                $match: {
                    foodPartner: foodPartnerId,
                },
            },
            {
                $group : {
                    _id : null,
                    totalReels : { $sum : 1 },
                    totalLikes : { $sum : "$likeCount" },
                    totalSaves : { $sum : "$saveCount" },
                },
            },
            {
                $project : {
                    _id : 0,
                    totalReels : 1,
                    totalLikes : 1,
                    totalSaves : 1,
                },
            },
        ]);

        const topReels = await foodModel.aggregate([
            {
                $match: {
                    foodPartner: foodPartnerId,
                },
            },
            {
                $sort: {
                    likeCount: -1,
                    saveCount: -1,
                    createdAt: -1,
                },
            },
            {
                $limit: 5,
            },
            {
                $project : {
                    name:1,
                    video: 1,
                    likeCount: 1,
                    saveCount : 1,
                    createdAt: 1,
                },
            },
        ]);

        const timeline = await foodModel.aggregate([
            {
                $match:{
                    foodPartner: foodPartnerId,
                },
            },
            {
                $group:{
                    _id: {
                        $dateToString:{
                            format: "%Y-%m-%d",
                            date:"$createdAt",
                        },
                    },
                    uploads: {$sum :1},
                    likes: { $sum: "$likeCount"},
                    saves : {$sum: "$saveCount"},
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
            {
                $project : {
                    _id: 0,
                    date: "$_id",
                    uploads: 1,
                    likes: 1,
                    saves: 1,
                },
            },
        ]);

        const summary = summaryResult[0] || {
            totalReels: 0,
            totalLikes: 0,
            totalSaves: 0,
        };

        return res.status(200).json({
            success : true,
            data:{
                summary,
                topReels,
                timeline,
            },
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to fetch analytics data",
        });
    }
}

module.exports = {
    getFoodPartnerAnalytics,
};