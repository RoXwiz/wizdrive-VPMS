const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const logisticRoutes = require('./logistics/routes/logistic');
const profileRoutes = require('./logistics/routes/profile');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Routes
app.use('/api/logistics', logisticRoutes);
app.use('/api/profile', profileRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('JWT_SECRET loaded:', process.env.JWT_SECRET);
  console.log('MONGODB_URI loaded:', process.env.MONGODB_URI);
});