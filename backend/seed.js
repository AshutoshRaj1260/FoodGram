/**
 * seed.js — Dummy data seeder for the Food app
 *
 * What it does:
 *  1. Creates (or reuses) a dummy FoodPartner in MongoDB
 *  2. Fetches short public-domain food videos from sample sources
 *  3. Uploads each video to ImageKit
 *  4. Inserts Food documents pointing at the uploaded ImageKit URLs
 *
 * Usage:
 *   node seed.js
 *
 * Prerequisites:
 *   • Copy this file into  food/backend/
 *   • Make sure food/backend/.env contains valid values for:
 *       MONGO_URI, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
 *   • npm install  (dependencies already in package.json)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const ImageKit = require("imagekit");
const axios = require("axios");
const bcrypt = require("bcryptjs");

// ─── Models ──────────────────────────────────────────────────────────────────

const foodPartnerSchema = new mongoose.Schema({
  businessName: String,
  ownerName: String,
  phone: String,
  address: String,
  email: { type: String, unique: true },
  password: String,
});
const FoodPartner = mongoose.model("foodpartner", foodPartnerSchema);

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    video: { type: String, required: true },
    description: String,
    foodPartner: { type: mongoose.Schema.Types.ObjectId, ref: "foodpartner", required: true },
    likeCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Food = mongoose.model("food", foodSchema);

// ─── ImageKit client ─────────────────────────────────────────────────────────

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// ─── Dummy data ───────────────────────────────────────────────────────────────
//
// These are freely-usable, short food/cooking videos from Mixkit (royalty-free).
// ImageKit accepts a URL as the `file` param and will fetch + store the video.
//
const DUMMY_FOODS = [
  {
    name: "Pasta Aglio e Olio",
    description: "Classic Italian garlic pasta with olive oil and chilli flakes.",
    videoUrl:
      "https://assets.mixkit.co/videos/4410/4410-720.mp4",
  },
  {
    name: "Fresh Vegetable Salad",
    description: "A colourful salad with seasonal vegetables and lemon dressing.",
    videoUrl:
      "https://assets.mixkit.co/videos/4313/4313-720.mp4",
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a gooey molten centre.",
    videoUrl:
      "https://assets.mixkit.co/videos/4419/4419-720.mp4",
  },
  {
    name: "Grilled Chicken",
    description: "Herb-marinated grilled chicken with a golden crust.",
    videoUrl:
      "https://assets.mixkit.co/videos/4455/4455-720.mp4",
  },
  {
    name: "Berry Smoothie Bowl",
    description: "Thick mixed-berry smoothie topped with granola and fresh fruit.",
    videoUrl:
      "https://assets.mixkit.co/videos/4395/4395-720.mp4",
  },
];

const DUMMY_PARTNER = {
  businessName: "Seed Kitchen",
  ownerName: "Dev Seeder",
  phone: "9999999999",
  address: "123 Seed Street, Mumbai",
  email: "seed@foodapp.dev",
  password: "seedpass123",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function downloadBuffer(url) {
  console.log(`  ↓ Downloading ${url}`);
  const response = await axios.get(url, { responseType: "arraybuffer", timeout: 30_000 });
  return Buffer.from(response.data);
}

async function uploadToImageKit(buffer, fileName) {
  console.log(`  ↑ Uploading ${fileName} to ImageKit…`);
  const result = await imagekit.upload({
    file: buffer,
    fileName,
    folder: "/food-seeds",
    useUniqueFileName: true,
  });
  console.log(`  ✓ Uploaded → ${result.url}`);
  return result.url;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Connect to MongoDB
  console.log("\n🔗 Connecting to MongoDB…");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("   Connected.");

  // 2. Upsert dummy partner
  console.log("\n👤 Creating dummy FoodPartner…");
  let partner = await FoodPartner.findOne({ email: DUMMY_PARTNER.email });
  if (!partner) {
    const hashed = await bcrypt.hash(DUMMY_PARTNER.password, 10);
    partner = await FoodPartner.create({ ...DUMMY_PARTNER, password: hashed });
    console.log(`   Created partner: ${partner.businessName} (${partner._id})`);
  } else {
    console.log(`   Reusing existing partner: ${partner.businessName} (${partner._id})`);
  }

  // 3. Upload videos + insert food items
  console.log("\n🎬 Uploading videos and seeding food items…\n");

  const results = [];

  for (let i = 0; i < DUMMY_FOODS.length; i++) {
    const { name, description, videoUrl } = DUMMY_FOODS[i];
    const fileName = `seed_food_${i + 1}_${Date.now()}`;

    try {
      const buffer = await downloadBuffer(videoUrl);
      const uploadedUrl = await uploadToImageKit(buffer, fileName);

      const foodItem = await Food.create({
        name,
        description,
        video: uploadedUrl,
        foodPartner: partner._id,
        likeCount: Math.floor(Math.random() * 200),
        saveCount: Math.floor(Math.random() * 100),
      });

      console.log(`   📝 Saved "${name}" → ${foodItem._id}\n`);
      results.push({ name, id: foodItem._id, url: uploadedUrl });
    } catch (err) {
      console.error(`   ❌ Failed for "${name}":`, err.message);
    }
  }

  // 4. Summary
  console.log("\n✅ Seeding complete!");
  console.log(`   Partner ID : ${partner._id}`);
  console.log(`   Food items : ${results.length} inserted`);
  results.forEach((r) => console.log(`     • ${r.name}  [${r.id}]`));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});