require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');

const PORT = process.env.PORT || 3000;

console.log("Loaded URI:", process.env.MONGODB_URI);
connectDB();


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});