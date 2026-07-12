const express = require("express");
const multer = require("multer");
const router = express.Router();
const storyController = require("../controllers/story.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Memory storage — we pass the buffer straight to ImageKit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max (covers short story videos)
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/quicktime",
      "video/webm",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type for story. Use JPEG, PNG, WebP, GIF, MP4, MOV, or WebM."));
    }
  },
});

// ── Public / lightweight ───────────────────────────────────────────────────

// Lightweight has-story metadata used by the feed on initial load
// GET /api/stories/has-story?partnerIds=id1,id2
router.get("/has-story", storyController.hasStoryMap);

// Fetch active stories for a specific food partner (used by overlay)
// GET /api/stories/partner/:partnerId
router.get("/partner/:partnerId", storyController.getPartnerStories);

// Fetch active stories for a specific user
// GET /api/stories/user/:userId
router.get("/user/:userId", storyController.getUserStories);

// ── Authenticated — Food Partner ───────────────────────────────────────────

// Food partner uploads a story
// POST /api/stories/partner
router.post(
  "/partner",
  authMiddleware.authFoodPartnerMiddleware,
  upload.single("media"),
  storyController.uploadStory
);

// ── Authenticated — User ───────────────────────────────────────────────────

// User uploads a story
// POST /api/stories/user
router.post(
  "/user",
  authMiddleware.authUserMiddleware,
  upload.single("media"),
  storyController.uploadStory
);

// ── Delete (works for both partner and user via combined middleware) ────────

// Food partner deletes their own story
// DELETE /api/stories/partner/:storyId
router.delete(
  "/partner/:storyId",
  authMiddleware.authFoodPartnerMiddleware,
  storyController.deleteStory
);

// User deletes their own story
// DELETE /api/stories/user/:storyId
router.delete(
  "/user/:storyId",
  authMiddleware.authUserMiddleware,
  storyController.deleteStory
);

module.exports = router;