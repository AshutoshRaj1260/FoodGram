const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
  {
    // Who posted this story
    actorType: {
      type: String,
      enum: ["user", "foodpartner"],
      required: true,
    },
    // Reference to either userModel or foodPartnerModel
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "actorType",
    },
    // ImageKit file ID — stored so the cron can delete the asset before removing the document
    fileId: {
      type: String,
      required: true,
    },
    // Public CDN URL served to clients
    mediaUrl: {
      type: String,
      required: true,
    },
    // MIME type so the client knows whether to render <video> or <img>
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    // Hard expiry timestamp — cron uses this to find stale stories
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Index to make the cron query fast
storySchema.index({ expiresAt: 1 });
// Index so fetching stories by actor is fast
storySchema.index({ actor: 1, actorType: 1 });

const storyModel = mongoose.model("story", storySchema);

module.exports = storyModel;