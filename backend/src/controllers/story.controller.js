const { v4: uuid } = require("uuid");
const storyModel = require("../models/story.model");
const storageService = require("../services/storage.service");
const ImageKit = require("imagekit");

// Re-use the same ImageKit instance the storage service already configures
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Story TTL in hours
const STORY_TTL_HOURS = 24;

/**
 * POST /api/stories
 * Food-partner or user uploads a new story (image or short video).
 * Requires authFoodPartnerMiddleware OR authUserMiddleware depending on route.
 */
async function uploadStory(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided." });
    }

    const mime = req.file.mimetype || "";
    const mediaType = mime.startsWith("video/") ? "video" : "image";

    // Upload to ImageKit and capture fileId for later cleanup
    const uploadResult = await storageService.uploadFile(
      req.file.buffer,
      `story_${uuid()}`
    );

    const expiresAt = new Date(Date.now() + STORY_TTL_HOURS * 60 * 60 * 1000);

    // Determine actor from whichever middleware ran
    const actorType = req.foodPartner ? "foodpartner" : "user";
    const actor = req.foodPartner ? req.foodPartner._id : req.user._id;

    const story = await storyModel.create({
      actorType,
      actor,
      fileId: uploadResult.fileId,
      mediaUrl: uploadResult.url,
      mediaType,
      expiresAt,
    });

    res.status(201).json({
      message: "Story uploaded successfully",
      story,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/stories/partner/:partnerId
 * Returns all active (non-expired) stories for a food partner.
 * Public endpoint — no auth required.
 */
async function getPartnerStories(req, res, next) {
  try {
    const { partnerId } = req.params;

    const stories = await storyModel
      .find({
        actor: partnerId,
        actorType: "foodpartner",
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: 1 });

    res.status(200).json({
      message: "Stories fetched successfully",
      stories,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/stories/user/:userId
 * Returns all active stories for a specific user.
 * Public endpoint.
 */
async function getUserStories(req, res, next) {
  try {
    const { userId } = req.params;

    const stories = await storyModel
      .find({
        actor: userId,
        actorType: "user",
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: 1 });

    res.status(200).json({
      message: "Stories fetched successfully",
      stories,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/stories/has-story
 * Returns lightweight { partnerId: bool } metadata for an array of partner IDs.
 * Used by the feed on initial load so we know which partner avatars to ring.
 * Query param: ?partnerIds=id1,id2,id3
 */
async function hasStoryMap(req, res, next) {
  try {
    const raw = req.query.partnerIds || "";
    const partnerIds = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (partnerIds.length === 0) {
      return res.status(200).json({ hasStory: {} });
    }

    // Find partners that have at least one active story
    const activeStories = await storyModel.distinct("actor", {
      actor: { $in: partnerIds },
      actorType: "foodpartner",
      expiresAt: { $gt: new Date() },
    });

    const activeSet = new Set(activeStories.map(String));
    const hasStory = {};
    for (const id of partnerIds) {
      hasStory[id] = activeSet.has(id);
    }

    res.status(200).json({ hasStory });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/stories/:storyId
 * Delete a story owned by the authenticated actor.
 * Removes the ImageKit asset first, then the MongoDB document.
 */
async function deleteStory(req, res, next) {
  try {
    const { storyId } = req.params;

    const story = await storyModel.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found." });
    }

    // Confirm ownership
    const actorId = req.foodPartner
      ? String(req.foodPartner._id)
      : String(req.user._id);

    if (String(story.actor) !== actorId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this story." });
    }

    // Delete asset from ImageKit before removing the document
    try {
      await imagekit.deleteFile(story.fileId);
    } catch (ikErr) {
      // Log but don't block — document will still be removed
      console.error(
        `[STORY] ImageKit delete failed for fileId ${story.fileId}:`,
        ikErr.message
      );
    }

    await story.deleteOne();

    res.status(200).json({ message: "Story deleted successfully." });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadStory,
  getPartnerStories,
  getUserStories,
  hasStoryMap,
  deleteStory,
};