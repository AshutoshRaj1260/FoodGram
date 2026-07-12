const cron = require("node-cron");
const ImageKit = require("imagekit");
const storyModel = require("../models/story.model");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * Purge expired stories.
 * Order matters: delete the ImageKit asset first so we never orphan files.
 * Only after the asset is gone do we remove the MongoDB document.
 */
async function purgeExpiredStories() {
  try {
    const expiredStories = await storyModel.find({
      expiresAt: { $lt: new Date() },
    });

    if (expiredStories.length === 0) {
      console.log("[STORY CRON] No expired stories found.");
      return;
    }

    console.log(
      `[STORY CRON] Found ${expiredStories.length} expired story/stories. Cleaning up...`
    );

    let deleted = 0;
    let failed = 0;

    for (const story of expiredStories) {
      try {
        // 1. Remove the file from ImageKit so we never leave orphaned assets
        await imagekit.deleteFile(story.fileId);
      } catch (ikErr) {
        // Treat a "not found" on ImageKit as already gone — safe to continue
        const alreadyGone =
          ikErr?.message?.toLowerCase().includes("not found") ||
          ikErr?.statusCode === 404;

        if (!alreadyGone) {
          console.error(
            `[STORY CRON] Failed to delete ImageKit file ${story.fileId} for story ${story._id}:`,
            ikErr.message
          );
          failed++;
          // Skip document removal — we'll retry next cycle
          continue;
        }

        console.warn(
          `[STORY CRON] ImageKit file ${story.fileId} already gone — proceeding with document removal.`
        );
      }

      // 2. Now safe to remove the MongoDB document
      try {
        await story.deleteOne();
        deleted++;
      } catch (dbErr) {
        console.error(
          `[STORY CRON] Failed to delete MongoDB document for story ${story._id}:`,
          dbErr.message
        );
        failed++;
      }
    }

    console.log(
      `[STORY CRON] Done — deleted: ${deleted}, failed: ${failed}.`
    );
  } catch (err) {
    console.error("[STORY CRON] Unexpected error during purge:", err.message);
  }
}

/**
 * Register the cron job.
 * Schedule: every hour at minute 0.
 * Call this once from server.js after the DB connection is established.
 */
function startStoryCron() {
  // Run immediately on startup to catch any stories that expired while the server was down
  purgeExpiredStories();

  // Then run every hour
  cron.schedule("0 * * * *", () => {
    console.log("[STORY CRON] Hourly purge triggered.");
    purgeExpiredStories();
  });

  console.log("[STORY CRON] Hourly story-expiry cron registered.");
}

module.exports = { startStoryCron, purgeExpiredStories };