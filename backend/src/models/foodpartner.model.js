const mongoose = require("mongoose");

const foodPartnerSchema = new mongoose.Schema({
    businessName: {
        type: String,
        required: true
    },
    ownerName:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required : true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    verifyOTP: {
        type: String
    },
    verifyOTPExpires: {
        type: Date
    }
})

const foodPartnerModel = mongoose.model("foodpartner", foodPartnerSchema);

module.exports = foodPartnerModel;