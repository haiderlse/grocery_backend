const mongoose = require('mongoose');

const deliveryAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'PK' },
  floor: { type: String },
  instructions: { type: String },
  isDefault: { type: Boolean, default: false },
}, {_id: false});

const paymentMethodSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'JazzCash', 'CreditCard'
  details: { type: String, required: true }, // e.g., '**** **** **** 1234' or '03001234567'
  isDefault: { type: Boolean, default: false },
}, {_id: false});

const userProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  // passwordHash: { type: String, required: true }, // Important for real apps
  addresses: [deliveryAddressSchema],
  paymentMethods: [paymentMethodSchema],
  role: {
    type: String,
    required: true,
    enum: ['customer', 'admin', 'rider'],
    default: 'customer',
  },
  // preferences, orderHistory (as array of Order IDs), etc. could be added
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
});

userProfileSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const User = mongoose.model('User', userProfileSchema);

const mockUsers = [
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Ali Khan',
    email: 'ali.pro@example.com',
    phone: '+92 300 1234567',
    role: 'customer', // Added role
    // passwordHash: 'hashed_password_example',
    addresses: [
      {
        street: '36/1 Khayaban e Muslim, DHA Phase 6',
        city: 'Karachi',
        postalCode: '75500',
        country: 'PK',
        floor: '1st Floor',
        instructions: 'Ring bell twice.',
        isDefault: true,
      },
      {
        street: 'Office 7B, Tech Park Tower',
        city: 'Lahore',
        postalCode: '54000',
        country: 'PK',
        instructions: 'Deliver to reception.',
        isDefault: false,
      },
    ],
    paymentMethods: [
      {
        type: 'JazzCash',
        details: '03001234567',
        isDefault: true,
      },
      {
        type: 'CreditCard',
        details: '**** **** **** 4321',
        isDefault: false,
      }
    ]
  },
  {
    _id: new mongoose.Types.ObjectId(),
    name: 'Fatima Ahmed',
    email: 'fatima.a@example.com',
    phone: '+92 321 9876543',
    role: 'customer', // Added role
    addresses: [
      {
        street: 'House 12, Street 5, Sector F-7/1',
        city: 'Islamabad',
        postalCode: '44000',
        country: 'PK',
        isDefault: true,
      }
    ],
    paymentMethods: [
      {
        type: 'EasyPaisa',
        details: '03219876543',
        isDefault: true,
      }
    ]
  }
];

module.exports = { User, mockUsers, deliveryAddressSchema, paymentMethodSchema };