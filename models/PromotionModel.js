const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true }, // Used for banner, optional for card if using icon
  shortDescription: { type: String }, // For smaller promo cards
  type: { type: String, enum: ['banner', 'card'], required: true },
  discountCode: { type: String },
  validUntil: { type: Date },
  // You could add targetLink or targetCategory/Product ID if promotions link somewhere specific
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
});

promotionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Promotion = mongoose.model('Promotion', promotionSchema);

const mockPromotions = [
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Weekend Super Saver!',
    description: 'Get up to 30% off on all dairy and bakery items this weekend only.',
    imageUrl: 'https://qne.com.pk/cdn/shop/collections/P_G-Brand-Banner.jpg?v=1729943165&width=1100',
    type: 'banner',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Fresh Produce Fiesta',
    description: 'Enjoy 15% off on all fresh fruits and vegetables. Stock up on health!',
    imageUrl: 'https://placehold.co/728x200/4CAF50/FFFFFF?text=Fresh+Produce+Fiesta',
    type: 'banner',
    discountCode: 'FRESH15',
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Snack Attack Discount',
    description: 'Buy 2 Get 1 Free on selected chips and cookies.',
    imageUrl: 'https://placehold.co/728x200/FFC107/333333?text=Snack+Attack',
    type: 'banner',
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Free Delivery Over Rs. 1000',
    description: 'Shop for Rs. 1000 or more and get your delivery absolutely free!',
    imageUrl: 'https://placehold.co/300x150/9C27B0/FFFFFF?text=Free+Delivery', // Used by PromoBanner card type as an icon
    shortDescription: 'Free delivery on orders over Rs. 1000',
    type: 'card',
  },
  {
    _id: new mongoose.Types.ObjectId(),
    title: 'Household Helpers Discount',
    description: '10% off all cleaning supplies and household essentials.',
    imageUrl: 'https://placehold.co/300x150/03A9F4/FFFFFF?text=Clean+Up',
    shortDescription: '10% off household essentials',
    type: 'card',
    discountCode: 'CLEAN10',
  },
];

module.exports = { Promotion, mockPromotions };