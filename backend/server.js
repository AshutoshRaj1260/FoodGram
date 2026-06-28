require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const { startStoryCron } = require('./src/jobs/story.cron');

const PORT = process.env.PORT || 3000;

console.log("Loaded URI:", process.env.MONGO_URI);
(async () => {
  await connectDB();

  // Start the hourly cron that cleans up expired stories
  startStoryCron();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();