
const { Order } = require('../models/OrderModel');
const { Product } = require('../models/ProductModel'); // To fetch product details

// Helper function to validate ObjectIds
const mongoose = require('mongoose');
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

console.log('--- DEBUG: [CONTROLLER] orderController.js - START ---');

// Create a new order (typically by customer)
exports.createOrder = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] createOrder - Handler called with body:', req.body);
  try {
    const {
      userId,
      items, 
      deliveryAddress,
      paymentMethod,
      paymentDetails, 
      paymentStatus = 'Pending', 
      orderStatus = 'AwaitingPayment', 
      riderTip,
      specialInstructions,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item.' });
    }
    if (!deliveryAddress || typeof deliveryAddress !== 'object' || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode || !deliveryAddress.country) {
      return res.status(400).json({ message: 'Valid delivery address (street, city, postalCode, country) is required.' });
    }
    if (!paymentMethod || typeof paymentMethod !== 'string') {
      return res.status(400).json({ message: 'Payment method is required and must be a string.' });
    }

    let calculatedTotalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.productId || !isValidObjectId(item.productId) || !item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
          return res.status(400).json({ message: `Invalid item data: Product ID and positive quantity required. Problem with item: ${JSON.stringify(item)}` });
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
      }
      // TODO: Robust stock check and decrement (ideally within a transaction)
      // if (product.stock < item.quantity) {
      //   return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${product.stock}` });
      // }

      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price, 
        quantity: item.quantity,
        imageUrl: product.imageUrl,
      });
      calculatedTotalAmount += product.price * item.quantity;
    }
    
    if (riderTip && typeof riderTip === 'number' && riderTip > 0) {
        calculatedTotalAmount += riderTip;
    } else if (riderTip && typeof riderTip !== 'number') {
        return res.status(400).json({ message: 'Rider tip must be a number.'});
    }


    const newOrder = new Order({
      userId: (userId && isValidObjectId(userId)) ? userId : null,
      items: orderItems,
      totalAmount: calculatedTotalAmount,
      deliveryAddress,
      paymentMethod,
      paymentDetails,
      paymentStatus,
      orderStatus: paymentStatus === 'Paid' ? 'Pending' : orderStatus,
      riderTip: riderTip || 0,
      specialInstructions,
    });

    const savedOrder = await newOrder.save();
    console.log('--- DEBUG: [CONTROLLER] createOrder - Order saved successfully:', savedOrder.id);
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in createOrder:', err.message, err.stack);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: "Validation Error", errors: err.errors });
    }
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.createOrder. Type:', typeof exports.createOrder);

// Get all orders (for admin)
exports.getAllOrders = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] getAllOrders - Handler called with query:', req.query);
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20; 
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.orderStatus) filter.orderStatus = req.query.orderStatus;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.userId && isValidObjectId(req.query.userId)) filter.userId = req.query.userId;
    
    const sortOptions = req.query.sort ? { [req.query.sort]: req.query.order === 'asc' ? 1 : -1 } : { orderDate: -1 };

    console.log('--- DEBUG: [CONTROLLER] getAllOrders - Query filters:', filter, 'Pagination:', { page, limit, skip }, 'Sort:', sortOptions);

    const orders = await Order.find(filter)
        .populate('userId', 'name email') // Populate user details
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
        
    const totalOrders = await Order.countDocuments(filter);
    console.log('--- DEBUG: [CONTROLLER] getAllOrders - Found orders:', orders.length, 'Total matching filter:', totalOrders);

    res.json({
        orders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders
    });
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in getAllOrders:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.getAllOrders. Type:', typeof exports.getAllOrders);

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] getOrderById - Handler called for ID:', req.params.id);
  try {
    if (!isValidObjectId(req.params.id)) {
        console.warn('--- DEBUG: [CONTROLLER] getOrderById - Invalid ID format:', req.params.id);
        return res.status(400).json({ message: 'Invalid order ID format.' });
    }
    const order = await Order.findById(req.params.id).populate('userId', 'name email');
    if (!order) {
      console.warn('--- DEBUG: [CONTROLLER] getOrderById - Order not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] getOrderById - Order found:', order.id);
    res.json(order);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in getOrderById:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.getOrderById. Type:', typeof exports.getOrderById);

// Update an order (for admin: status, notes, etc.)
exports.updateOrderAdmin = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] updateOrderAdmin - Handler called for ID:', req.params.id, 'with body:', req.body);
  try {
    if (!isValidObjectId(req.params.id)) {
      console.warn('--- DEBUG: [CONTROLLER] updateOrderAdmin - Invalid ID format:', req.params.id);
      return res.status(400).json({ message: 'Invalid order ID format.' });
    }
    const { orderStatus, paymentStatus, adminNotes, estimatedDeliveryTime, paymentDetails } = req.body;

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes; // Allow empty string
    if (estimatedDeliveryTime !== undefined) updateData.estimatedDeliveryTime = estimatedDeliveryTime;
    if (paymentDetails !== undefined) updateData.paymentDetails = paymentDetails;

    if (Object.keys(updateData).length === 0) {
        console.warn('--- DEBUG: [CONTROLLER] updateOrderAdmin - No update data provided.');
        return res.status(400).json({ message: 'No update data provided.' });
    }
    console.log('--- DEBUG: [CONTROLLER] updateOrderAdmin - Update data for $set:', updateData);

    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true });

    if (!order) {
      console.warn('--- DEBUG: [CONTROLLER] updateOrderAdmin - Order not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }
    console.log('--- DEBUG: [CONTROLLER] updateOrderAdmin - Order updated successfully:', order.id);
    res.json(order);
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in updateOrderAdmin:', err.message, err.stack);
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.updateOrderAdmin. Type:', typeof exports.updateOrderAdmin);

// Delete an order (use with caution)
exports.deleteOrder = async (req, res) => {
  console.log('--- DEBUG: [CONTROLLER] deleteOrder - Handler called for ID:', req.params.id);
  try {
    if (!isValidObjectId(req.params.id)) {
      console.warn('--- DEBUG: [CONTROLLER] deleteOrder - Invalid ID format:', req.params.id);
      return res.status(400).json({ message: 'Invalid order ID format.' });
    }
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      console.warn('--- DEBUG: [CONTROLLER] deleteOrder - Order not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }
    // Consider if stock should be replenished upon order deletion
    console.log('--- DEBUG: [CONTROLLER] deleteOrder - Order deleted successfully:', order.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('--- DEBUG: [CONTROLLER] Error in deleteOrder:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
};
console.log('--- DEBUG: [CONTROLLER] Assigned exports.deleteOrder. Type:', typeof exports.deleteOrder);

console.log('--- DEBUG: [CONTROLLER] orderController.js - END ---');
console.log('--- DEBUG: [CONTROLLER] Final module.exports keys for orderController:', Object.keys(module.exports));
console.log('--- DEBUG: [CONTROLLER] module.exports itself for orderController:', module.exports);
