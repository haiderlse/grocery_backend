const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
  productCount: { type: Number, default: 0 }, // This can be dynamically updated
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
});

categorySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Category = mongoose.model('Category', categorySchema);

const mockCategories = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Fruits & Vegetables',
    imageUrl: 'https://placehold.co/100x100/8BC34A/FFFFFF?text=Fruits',
    productCount: 5, // Example, adjust based on actual products
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Dairy & Eggs',
    imageUrl: 'https://placehold.co/100x100/FFEB3B/333333?text=Dairy',
    productCount: 4,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Bakery',
    imageUrl: 'https://placehold.co/100x100/FF9800/FFFFFF?text=Bakery',
    productCount: 3,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Meat & Seafood',
    imageUrl: 'https://placehold.co/100x100/F44336/FFFFFF?text=Meat',
    productCount: 3,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Snacks',
    imageUrl: 'https://placehold.co/100x100/2196F3/FFFFFF?text=Snacks',
    productCount: 4,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Beverages',
    imageUrl: 'https://placehold.co/100x100/00BCD4/FFFFFF?text=Drinks',
    productCount: 3,
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Household Essentials',
    imageUrl: 'https://placehold.co/100x100/607D8B/FFFFFF?text=Household',
    productCount: 2,
  },
];

module.exports = { Category, mockCategories };