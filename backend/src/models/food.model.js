const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    video: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "foodpartner",
        required: true
    },
    likeCount: {
        type: Number,
        default: 0
    },
    saveCount: {
        type: Number,
        default: 0
    }
},
 { timestamps: true });

foodSchema.index({ foodPartner: 1 , createdAt: -1 });
foodSchema.index({ foodPartner: 1 , likeCount: -1 });
foodSchema.index({ foodPartner: 1 , saveCount: -1 });

const foodModel = mongoose.model("food", foodSchema);

module.exports = foodModel;