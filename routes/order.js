
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/ordercontroller');
// const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware'); // Placeholder for auth middleware

console.log('--- DEBUG: [ROUTES] order.js - Requiring orderController ---');
if (!orderController || Object.keys(orderController).length === 0) {
  console.error('--- DEBUG: [ROUTES] CRITICAL: orderController appears to be empty or not loaded correctly!');
} else {
  console.log('--- DEBUG: [ROUTES] orderController loaded. Keys:', Object.keys(orderController));
}

// POST /api/orders - Create a new order (customer action)
// Auth might be optional if guest checkout is allowed
if (orderController.createOrder) {
  router.post('/', orderController.createOrder);
  console.log('--- DEBUG: [ROUTES] Registered POST /api/orders to orderController.createOrder');
} else {
  console.error('--- DEBUG: [ROUTES] ERROR: orderController.createOrder is undefined!');
}


// GET /api/orders - Get all orders (admin action)
// Add authorizeAdmin if you have admin roles
if (orderController.getAllOrders) {
  router.get('/', /* authorizeAdmin, */ orderController.getAllOrders);
  console.log('--- DEBUG: [ROUTES] Registered GET /api/orders to orderController.getAllOrders');
} else {
  console.error('--- DEBUG: [ROUTES] ERROR: orderController.getAllOrders is undefined!');
}


// GET /api/orders/:id - Get a single order by ID (customer or admin)
// Add specific auth checks if needed, e.g., customer can only get their own orders
if (orderController.getOrderById) {
  router.get('/:id', /* authenticate, */ orderController.getOrderById);
  console.log('--- DEBUG: [ROUTES] Registered GET /api/orders/:id to orderController.getOrderById');
} else {
  console.error('--- DEBUG: [ROUTES] ERROR: orderController.getOrderById is undefined!');
}


// PUT /api/orders/admin/:id - Update order status, notes, etc. (admin action)
if (orderController.updateOrderAdmin) {
  router.put('/admin/:id', /* authorizeAdmin, */ orderController.updateOrderAdmin);
  console.log('--- DEBUG: [ROUTES] Registered PUT /api/orders/admin/:id to orderController.updateOrderAdmin');
} else {
  console.error('--- DEBUG: [ROUTES] ERROR: orderController.updateOrderAdmin is undefined!');
}


// DELETE /api/orders/:id - Delete an order (admin action, use with caution)
if (orderController.deleteOrder) {
  router.delete('/:id', /* authorizeAdmin, */ orderController.deleteOrder);
  console.log('--- DEBUG: [ROUTES] Registered DELETE /api/orders/:id to orderController.deleteOrder');
} else {
  console.error('--- DEBUG: [ROUTES] ERROR: orderController.deleteOrder is undefined!');
}

console.log('--- DEBUG: [ROUTES] order.js - Exporting router ---');
module.exports = router;
