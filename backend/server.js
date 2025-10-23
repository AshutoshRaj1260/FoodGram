require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');

console.log("Loaded URI:", process.env.MONGODB_URI);
connectDB();


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});