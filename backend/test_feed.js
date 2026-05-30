require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const userModel = require('./src/models/user.model');
const foodModel = require('./src/models/food.model');
const likeModel = require('./src/models/likes.model');
const saveModel = require('./src/models/save.model');

const RECOMMENDER_URL =
  process.env.RECOMMENDER_URL || 'http://127.0.0.1:8002';

const BACKEND_URL =
  process.env.BACKEND_URL ||
  `http://127.0.0.1:${process.env.PORT || 3000}`;

async function waitFor(url, timeoutMs = 20000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      await axios.get(url, { timeout: 2000 });
      return true;
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return false;
}

(async () => {
  let user = null;
  let foods = [];

  try {
    await mongoose.connect(process.env.MONGO_URI);

    user = await userModel.create({
      fullName: 'Demo User',
      email: `demo-${Date.now()}@example.com`,
      password: 'x',
    });

    foods = await foodModel.create([
      {
        name: 'Demo Food A',
        video: 'https://example.com/a.mp4',
        description: 'a',
        foodPartner: new mongoose.Types.ObjectId(),
      },
      {
        name: 'Demo Food B',
        video: 'https://example.com/b.mp4',
        description: 'b',
        foodPartner: new mongoose.Types.ObjectId(),
      },
      {
        name: 'Demo Food C',
        video: 'https://example.com/c.mp4',
        description: 'c',
        foodPartner: new mongoose.Types.ObjectId(),
      },
    ]);

    await likeModel.create([
      { user: user._id, food: foods[0]._id },
      { user: user._id, food: foods[1]._id },
    ]);

    await saveModel.create({
      user: user._id,
      food: foods[2]._id,
    });

    await foodModel.updateOne(
      { _id: foods[0]._id },
      { $inc: { likeCount: 1 } }
    );

    await foodModel.updateOne(
      { _id: foods[1]._id },
      { $inc: { likeCount: 1 } }
    );

    await foodModel.updateOne(
      { _id: foods[2]._id },
      { $inc: { saveCount: 1 } }
    );

    const ok = await waitFor(
      `${RECOMMENDER_URL}/docs`,
      20000
    );

    if (!ok) {
      console.error(
        'Recommender not reachable at',
        RECOMMENDER_URL
      );
      return;
    }

    await axios.post(
      `${RECOMMENDER_URL}/rebuild`,
      {},
      { timeout: 20000 }
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 1500)
    );

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    const res = await axios.get(
      `${BACKEND_URL}/api/food`,
      {
        headers: {
          Cookie: `accessToken=${token}`,
        },
        timeout: 10000,
      }
    );

    if (!res.data) {
      throw new Error('No response data received');
    }

    console.log('Feed fetched successfully');
  } catch (err) {
    console.error(
      'Demo script error:',
      err.response?.data || err.message
    );
    process.exitCode = 1;
  } finally {
    try {
      if (user) {
        await Promise.all([
          likeModel.deleteMany({ user: user._id }),
          saveModel.deleteMany({ user: user._id }),
          foodModel.deleteMany({
            _id: { $in: foods.map((f) => f._id) },
          }),
          userModel.deleteOne({ _id: user._id }),
        ]);
      }
    } catch (cleanupError) {
      console.error(
        'Cleanup error:',
        cleanupError.message
      );
    }

    await mongoose.disconnect();
  }
})();
