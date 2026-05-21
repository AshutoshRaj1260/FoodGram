const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Ensure collections are created for transactions
        const likeModel = require('../models/likes.model');
        const saveModel = require('../models/save.model');

        await Promise.all([
            likeModel.createCollection(),
            saveModel.createCollection()
        ]);
        console.log("Collections initialized for transactions");
    } catch (err) {
        console.error("Error connecting to MongoDB or initializing collections:", err);
    }
}

module.exports = connectDB;