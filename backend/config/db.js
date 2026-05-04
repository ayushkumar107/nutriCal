const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.MONGO_URI.includes('localhost')) {
      console.warn('WARNING: You are using a localhost MongoDB URI. This will NOT work on Render. Please use a MongoDB Atlas connection string.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
