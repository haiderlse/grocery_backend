
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors =require('cors');

dotenv.config();

const app = express();

// Middlewares
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Import Routes
// Corrected paths to be relative to backend/index.js
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const promotionRoutes = require('./routes/promotion');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order'); // New order routes

// Use Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes); // Using the new order routes

// Basic welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Pick Me Up API! Server is running.');
});

// Handle 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Global error handler (optional, but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke on the server!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}. Access API at http://localhost:${PORT}`);
});