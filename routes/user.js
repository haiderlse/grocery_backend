const express = require('express');
const router = express.Router();

// Adjust the path based on your directory structure.
// If 'routes' is in 'node-backend/routes' and 'controllers' are in 'node-backend/backend/controllers':
const userController = require('../controllers/usercontroller'); // Corrected path assuming routes are in backend/routes

// GET all users
// Corresponds to: GET /api/users/
router.get('/', userController.getAllUsers);

// GET a single user by ID
// Corresponds to: GET /api/users/:id
router.get('/:id', userController.getUserById);

// POST create a new user
// Corresponds to: POST /api/users/
router.post('/', userController.createUser);

// PUT update a user by ID
// Corresponds to: PUT /api/users/:id
// This is likely the route causing issues if line 15 in your original file refers to this.
router.put('/:id', userController.updateUserById);

// DELETE a user by ID
// Corresponds to: DELETE /api/users/:id
router.delete('/:id', userController.deleteUserById);

module.exports = router;