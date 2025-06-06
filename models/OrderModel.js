
const mongoose = require('mongoose');
const { deliveryAddressSchema } = require('./UserModel'); // Assuming UserModel exports this

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, // Denormalized product name
  price: { type: Number, required: true }, // Price at the time of order
  quantity: { type: Number, required: true, min: 1 },
  imageUrl: { type: String, required: true }, // Denormalized image URL
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, for guest checkouts
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: deliveryAddressSchema, required: true },
  paymentMethod: { type: String, required: true },
  paymentDetails: { type: String }, 
  paymentStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Processing'],
    default: 'Pending',
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['AwaitingPayment', 'Pending', 'Processing', 'PickedUp', 'EnRoute', 'Shipped', 'Delivered', 'Cancelled'], // Added 'EnRoute'
    default: 'AwaitingPayment', 
  },
  orderDate: { type: Date, default: Date.now },
  estimatedDeliveryTime: { type: String },
  riderTip: { type: Number, default: 0 },
  specialInstructions: { type: String }, 
  adminNotes: {type: String }, 
  riderDetails: { 
    name: { type: String },
    phone: { type: String },
    imageUrl: { type: String }
  },
  riderNotes: { type: String }, // Added for rider app
  proofOfDeliveryImageUrl: { type: String }, // Added for rider app
  pickupAddress: { // For scenarios where rider picks up from a different location than main store (e.g. restaurant partner)
    name: { type: String }, // e.g. "KFC Restaurant - Tariq Road"
    street: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
    phone: { type: String }, // Contact at pickup location
    latitude: { type: Number },
    longitude: { type: Number },
  }
}, {
  timestamps: true, 
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

orderSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order, orderItemSchema };