const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { Category, mockCategories } = require('./models/CategoryModel');
const { Product, mockProducts } = require('./models/ProductModel');
const { Promotion, mockPromotions } = require('./models/PromotionModel');
const { User, mockUsers } = require('./models/UserModel');

dotenv.config(); // Load environment variables from .env file

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not defined in your .env file.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding...');

    // Clear existing data (optional, but recommended for a clean seed)
    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Promotion.deleteMany({});
    await User.deleteMany({});
    console.log('Existing data cleared.');

    // Insert mock data
    console.log('Inserting mock categories...');
    await Category.insertMany(mockCategories);
    console.log(`${mockCategories.length} categories inserted.`);

    console.log('Inserting mock products...');
    await Product.insertMany(mockProducts);
    console.log(`${mockProducts.length} products inserted.`);

    console.log('Inserting mock promotions...');
    await Promotion.insertMany(mockPromotions);
    console.log(`${mockPromotions.length} promotions inserted.`);

    console.log('Inserting mock users...');
    await User.insertMany(mockUsers);
    console.log(`${mockUsers.length} users inserted.`);

    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1); // Exit with error
  } finally {
    // Disconnect Mongoose
    if (mongoose.connection.readyState === 1) { // 1 means connected
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
  }
};

// Run the seeder function
seedDatabase();