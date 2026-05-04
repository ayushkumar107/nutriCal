const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

const path = require('path');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/meals', require('./routes/mealRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(frontendPath, 'index.html'));
    }
  });
} else {
  // Basic route for development
  app.get('/', (req, res) => {
    res.send('API is running in development mode...');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
